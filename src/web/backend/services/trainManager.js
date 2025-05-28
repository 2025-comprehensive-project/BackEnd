const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { logger, createTrainLogger } = require("../utils/logger");
const { stopFlaskServer } = require("./flaskManager");
const { getTrainStatus, setTrainStatus, updateTrainStatus } = require("../utils/trainStatusManager");

const baseDir = path.join(__dirname, "../../../ai/chatbot");
const modelDir = path.join(baseDir, "models");
const dataDir = path.join(baseDir, "data");
const trainerDir = path.join(baseDir, "trainer");

const trainProcesses = new Map();

// ────────── 학습 프로세스 관리 ──────────
const registerProcess = (version, proc) => trainProcesses.set(version, proc);
const getProcess = (version) => trainProcesses.get(version);
const abortProcess = (version) => {
  const proc = trainProcesses.get(version);
  if (proc) {
    proc.kill("SIGINT");
    trainProcesses.delete(version);
    return true;
  }
  return false;
};

// ────────── 유틸 함수 ──────────
const getBaseModelVersions = () => {
  const basePath = path.join(modelDir, "base");
  try {
    return fs.readdirSync(basePath).filter((file) =>
      fs.statSync(path.join(basePath, file)).isDirectory()
    );
  } catch {
    return [];
  }
};

const getLoraAdapterVersions = () => {
  const loraPath = path.join(modelDir, "lora");
  try {
    return fs.readdirSync(loraPath).filter((file) =>
      fs.statSync(path.join(loraPath, file)).isDirectory()
    );
  } catch {
    return [];
  }
};

const getLoraAdapterPath = async (npc_id) => {
  const { data: npcVersions } = await axios.get(`${process.env.FLASK_BASE_URL}/npc-version`);
  const version = npcVersions[npc_id];
  if (!version) return null;
  return path.join(modelDir, "lora", version);
};

const getLatestCheckpoint = (outDir) => {
  try {
    const entries = fs.readdirSync(outDir, { withFileTypes: true });
    const ckpts = entries
      .filter(e => e.isDirectory() && /^checkpoint-\\d+$/.test(e.name))
      .map(e => ({ name: e.name, step: parseInt(e.name.split("-")[1]) }))
      .sort((a, b) => b.step - a.step);
    return ckpts.length > 0 ? ckpts[0] : null;
  } catch {
    return null;
  }
};

// ────────── 메인 파이프라인 ──────────
const runTrainPipeline = async ({
  type = "lora",
  version,
  baseModel,
  datapath,
  target,
  source = "beomi",
  train_path,
  val_path,
  epochs,
  lr,
  bsz,
  gradAcc,
  maxLen,
  merge = false,
  resume = false,
  load_in_4bit = false
}) => {
  if (type === "base") {
    try {
      logger.info("🛑 BASE 학습 시작 전 Flask 서버 종료 요청");
      await stopFlaskServer();
    } catch (e) {
      logger.warn(`⚠️ Flask 종료 실패: ${e.message}`);
    }
  }

  const trainLogger = createTrainLogger(version, type);
  const outDir = path.join(modelDir, type, version);
  const lastCheckpoint = getLatestCheckpoint(outDir);
  const shouldResume = resume && !!lastCheckpoint;

  if (shouldResume) {
    logger.info(`🔁 체크포인트 감지됨: ${lastCheckpoint.name}`);
    trainLogger.info(`🔁 체크포인트 감지됨: ${lastCheckpoint.name}`);
  } else {
    logger.info("🆕 새 학습 세션 시작 (체크포인트 없음)");
    trainLogger.info("🆕 새 학습 세션 시작 (체크포인트 없음)");
  }

  const basePath = path.join(modelDir, "base", baseModel);
  logger.info(`📁 베이스 모델 경로: ${basePath}`);

  if (!datapath && target) {
    datapath = path.join(dataDir, "lora", target, `${target}_train.jsonl`);
    logger.info(`🧩 target='${target}' 기반 datapath 자동 설정: ${datapath}`);
  }

  const getTrainScriptAndArgs = async () => {
    if (type === "lora" || type === "rola") {
      const isCustom = !!datapath;
      const args = [
        "-u",
        path.join(trainerDir, type === "rola" ? "train_rola.py" : "train_lora.py"),
        "--base", basePath,
        "--out", outDir,
        "--data", datapath,
        "--epochs", epochs,
        "--bsz", bsz,
        "--lr", lr,
        "--max_len", maxLen,
        "--grad_acc", gradAcc,
        ...(shouldResume ? ["--resume"] : [])
      ];

      if (type === "rola") {
        const npc_id = version.split("-")[0];
        const loraPath = await getLoraAdapterPath(npc_id);
        if (loraPath) {
          args.push("--lora", loraPath);
          logger.info(`🔁 [ROLA] LoRA 어댑터 자동 적용: ${loraPath}`);
        } else {
          logger.warn(`⚠️ [ROLA] '${npc_id}'에 대한 LoRA 경로를 찾을 수 없음`);
        }
      }

      return { args };
    }

    const isCustom = source === "custom";
    return {
      args: [
        "-u",
        path.join(trainerDir, "train_full_sft.py"),
        "--base", baseModel,
        "--out", outDir,
        "--source", source,
        ...(isCustom ? ["--train", train_path, "--val", val_path] : []),
        "--epochs", epochs,
        "--bsz", bsz,
        "--lr", lr,
        "--max_len", maxLen,
        "--grad_acc", gradAcc,
        ...(shouldResume ? ["--resume"] : []),
        ...(load_in_4bit ? ["--load_in_4bit"] : [])
      ]
    };
  };

  const { args } = await getTrainScriptAndArgs();

  logger.info(`🚀 [${type.toUpperCase()} 학습 시작] 버전: ${version}, 에폭: ${epochs}, lr: ${lr}, base: ${baseModel}`);
  trainLogger.info(`🔄 ${type.toUpperCase()} 학습 중…`);

  await setTrainStatus(version, {
    status: "running",
    currentEpoch: 0,
    totalEpochs: epochs,
    percent: 0,
    lastLog: "",
    loss: null,
    startedAt: new Date().toISOString(),
    eta: null
  });

  return new Promise((resolve, reject) => {
    const train = spawn("python", args);
    registerProcess(version, train);

    let lastError = "";

    train.stdout.on("data", async (data) => {
      const lines = data.toString().split("\n");
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        trainLogger.info(`[${type.toUpperCase()}-out] ${line}`);

        const dictMatch = line.match(/['"]loss['"]:\s*([0-9.]+).*['"]epoch['"]:\s*([0-9.]+)/);
        const match = line.match(/epoch\s*(\d+)\s*\/\s*(\d+).*?loss[:=]?\s*([\d.]+)/i);

        if (dictMatch || match) {
          const loss = parseFloat(dictMatch?.[1] || match?.[3]);
          const epoch = parseFloat(dictMatch?.[2] || match?.[1]);
          const totalEpochs = parseInt(match?.[2] || epochs);
          const percent = Math.round((epoch / totalEpochs) * 100);

          const startedAt = new Date((await getTrainStatus(version))?.startedAt || new Date());
          const now = new Date();
          const elapsedMs = now - startedAt;
          const eta = epoch > 0 ? new Date(now.getTime() + (elapsedMs / epoch) * (totalEpochs - epoch)).toISOString() : null;

          await updateTrainStatus(version, {
            currentEpoch: Math.floor(epoch),
            totalEpochs,
            percent,
            lastLog: line,
            loss,
            eta
          });
        }
      }
    });

    train.stderr.on("data", (data) => {
      const msg = data.toString().trim();
      lastError = msg;
      if (/error|exception|traceback/i.test(msg)) {
        trainLogger.error(`[${type.toUpperCase()}-err] ${msg}`);
      } else {
        trainLogger.info(`[${type.toUpperCase()}-log] ${msg}`);
      }
    });

    train.on("close", async (code) => {
      const status = code === 0 ? "completed" : "failed";
      await updateTrainStatus(version, {
        status,
        ...(status === "failed" ? { errorMessage: lastError } : {})
      });

      if (status === "failed") {
        trainLogger.error(`❌ ${type.toUpperCase()} 학습 실패 (종료 코드 ${code})`);
        return reject(`${type} training failed: ${lastError}`);
      }

      trainLogger.info(`✅ ${type.toUpperCase()} 학습 완료 → ${outDir}`);
      logger.info(`✅ ${type.toUpperCase()} 학습 완료 → ${outDir}`);

      if (!merge || type === "base") return resolve({ [`${type}_path`]: outDir });
    });
  });
};

// ────────── 모델 삭제 ──────────
const deleteModel = (type, version) => {
  const targetPath = path.join(modelDir, type, version);
  if (!fs.existsSync(targetPath)) {
    throw new Error("MODEL_NOT_FOUND");
  }
  fs.rmSync(targetPath, { recursive: true, force: true });
  return true;
};

module.exports = {
  runTrainPipeline,
  abortProcess,
  getBaseModelVersions,
  getLoraAdapterVersions,
  deleteModel
};