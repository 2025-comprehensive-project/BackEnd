const createError = require('../../../utils/errorCreator');
const { logger, createTrainLogger } = require('../../../utils/logger');
const { generateFromFlask } = require('../../../services/chatbotProxy');
const { startFlaskServer, stopFlaskServer, isFlaskRunning } = require('../../../services/flaskManager');
const trainManager = require('../../../services/trainManager');
const logManager = require('../../../services/logManager');
const { getAllActiveTrainings, getTrainStatus } = require('../../../utils/trainStatusManager');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

const { FLASK_BASE_URL } = process.env;

// ✅ Flask 서버 실행
const startFlaskServerAPI = async (req, res, next) => {
  try {
    await startFlaskServer();
    res.status(200).json({ message: '✅ Flask 서버 시작됨.' });
  } catch (err) {
    logger.error(`❌ Flask 서버 시작 실패: ${err.message}`);
    next(createError(400, err.message, 'FLASK_START_FAILED'));
  }
};

// 🛑 Flask 서버 종료
const stopFlaskServerAPI = async (req, res, next) => {
  try {
    await stopFlaskServer();
    res.status(200).json({ message: '🛑 Flask 서버 종료됨.' });
  } catch (err) {
    logger.error(`❌ Flask 서버 종료 실패: ${err.message}`);
    next(createError(400, err.message, 'FLASK_STOP_FAILED'));
  }
};

// ℹ️ Flask 상태 확인
const getFlaskStatus = async (req, res, next) => {
  try {
    const response = await axios.get('http://localhost:50003/status');
    res.status(200).json(response.data);
  } catch (err) {
    logger.warn('⚠️ Flask 서버가 꺼져 있습니다.');
    res.status(200).json({
      status: 'stopped',
      message: 'Flask 서버가 실행 중이 아닙니다.'
    });
  }
};

// ✅ 사용 가능한 모델 버전 목록 조회
const getAvailableVersions = async (req, res, next) => {
  try {
    const baseModelVersions = await trainManager.getBaseModelVersions();
    const loraAdapterVersions = await trainManager.getLoraAdapterVersions();

    res.status(200).json({
      baseModelVersions,
      loraAdapterVersions
    });
  } catch (err) {
    logger.error(`❌ 모델 버전 조회 실패: ${err.message}`);
    return next(createError(500, '❌ 모델 버전 조회 실패', 'MODEL_VERSION_FETCH_FAILED'));
  }
}

const changeModelVersion = async (req, res, next) => {
  const { type, version, npc_id } = req.body;

  if (!type || !version) {
    return next(createError(400, '❌ type과 version은 필수입니다.', 'MISSING_FIELDS'));
  }

  try {
    if (type === 'base') {
      // 베이스 모델 버전 변경
      const { data } = await axios.patch(`${FLASK_BASE_URL}/set-version`, { version });

      return res.status(200).json({
        message: `✅ 베이스 모델이 ${version}으로 교체되었습니다.`,
        flaskResponse: data
      });
    }

    if (type === 'lora') {
      if (!npc_id) {
        return next(createError(400, '❌ npc_id는 필수입니다.', 'MISSING_NPC_ID'));
      }

      // NPC별 서비스 모델 버전 고정
      const { data } = await axios.patch(`${FLASK_BASE_URL}/npc-version`, {
        npc_id,
        version
      });

      return res.status(200).json({
        message: `✅ NPC [${npc_id}]의 서비스 모델이 ${version}으로 설정되었습니다.`,
        flaskResponse: data
      });
    }

    return next(createError(400, '❌ type은 base 또는 lora여야 합니다.', 'INVALID_TYPE'));

  } catch (err) {
    console.error('❌ 모델 버전 변경 실패:', err.response?.data || err.message);
    next(createError(500, '모델 버전 변경 실패'));
  }
};

// 🗑️ 모델 삭제
const deleteModel = async (req, res, next) => {
  const { type, version } = req.body;

  if (!type || !version) {
    logger.error('❌ 모델 삭제 요청 누락: type 또는 version');
    return next(createError(400, 'type과 version은 필수입니다.', 'MISSING_FIELDS'));
  }

  try {
    trainManager.deleteModel(type, version);
    logger.info(`🗑️ 모델 삭제 완료: [${type}] ${version}`);
    res.status(200).json({ message: `🗑️ 모델 삭제 완료: [${type}] ${version}` });
  } catch (err) {
    const errorMap = {
      MODEL_NOT_FOUND: [404, '❌ 해당 모델이 존재하지 않습니다.']
    };
    const [status, message] = errorMap[err.message] || [500, '❌ 모델 삭제 중 서버 오류'];
    logger.error(`❌ 모델 삭제 실패: [${type}] ${version} - ${err.message}`);
    res.status(status).json({ message });
  }
};

// 📄 학습 로그 목록 조회
const getTrainLogList = async (req, res, next) => {
  try {
    const files = logManager.getLogList(); // 💡 전체 로그 조회 함수로 변경됨
    const totalCount = Object.values(files).reduce((acc, list) => acc + list.length, 0);
    // logger.info(`📄 전체 로그 목록 조회 완료 - 총 ${totalCount}개`);
    // logger.info(`📄 로그 목록: ${JSON.stringify(files)}`);
    res.json({ files });
  } catch (err) {
    logger.error(`❌ 로그 목록 조회 실패: ${err.message}`);
    res.status(500).json({ message: '❌ 로그 목록 조회 실패' });
  }
};

// 📄 로그 파일 상세 조회
const getTrainLogDetail = async (req, res, next) => {
  try {
    const { type, filename } = req.params;
    const content = logManager.getLogContent(type, filename);
    // logger.info(`📄 로그 상세 조회 성공: [${type}] ${filename}`);
    res.json({ type, filename, log: content });
  } catch (err) {
    const errorMap = {
      INVALID_TYPE: [400, '❌ type은 base, lora, rola 중 하나여야 합니다.'],
      INVALID_FILENAME: [400, '❌ 유효한 .log 파일명을 입력하세요.'],
      LOG_NOT_FOUND: [404, '❌ 해당 로그 파일을 찾을 수 없습니다.'],
    };
    const [status, message] = errorMap[err.message] || [500, '❌ 로그 파일 조회 실패'];
    logger.error(`❌ 로그 파일 조회 실패: [${req.params.type}/${req.params.filename}] - ${err.message}`);
    res.status(status).json({ message });
  }
};

// 🤖 챗봇 응답 테스트
const testChatbotResponse = async (req, res, next) => {
  const { npc_id } = req.params;
  const { prompt } = req.body;

  if (!npc_id || !prompt) {
    logger.error('❌ 필수 필드 누락: npc_id 또는 prompt');
    return next(createError(400, '❌ npc_id와 prompt는 필수입니다.', 'MISSING_FIELDS'));
  }

  try {
    const responseText = await generateFromFlask(prompt, npc_id);
    res.status(200).json({ npc_id, prompt, response: responseText });
  } catch (err) {
    logger.error(`❌ Flask 테스트 실패: ${err.message}`);
    return next(createError(500, '❌ Flask 테스트 실패', 'FLASK_TEST_FAILED'));
  }
};

// 📊 모델 평가
const evaluateModel = async (req, res, next) => {
  const {
    dataset_path, 
    model_type = "base",
    npc_id,
    user_id,
    slot_id
  } = req.body;

  if (!model_type) {
    return next(createError(400, '❌ model_type은 필수입니다.', 'MISSING_FIELDS'));
  }

  if (model_type !== 'base' && !dataset_path) {
    return next(createError(400, '❌ dataset_path는 base 외에 필수입니다.', 'MISSING_DATASET'));
  }

  const scriptPath = path.join(__dirname, '../../../../../ai/chatbot/tester/model_eval.py');
  const args = ['--model_type', model_type];

  if (model_type !== 'base' && dataset_path) {
    args.push('--dataset', dataset_path);
  }

  if (model_type === 'lora' && npc_id) {
    args.push('--npc_id', npc_id);
  }

  if (model_type === 'rola' && npc_id && user_id != null && slot_id != null) {
    args.push('--npc_id', npc_id, '--user_id', user_id.toString(), '--slot_id', slot_id.toString());
  }

  const pyProcess = spawn('python3', [scriptPath, ...args]);

  let result = '';
  let error = '';

  pyProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pyProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pyProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ 평가 실패: ${error}`);
      return res.status(500).json({ error: '평가 실패', details: error });
    }

    try {
      const parsed = JSON.parse(result);
      res.status(200).json(parsed);
    } catch (e) {
      console.error('❌ JSON 파싱 실패:', result);
      res.status(500).json({ error: 'JSON 파싱 실패', raw: result });
    }
  });
};


// 🧠 Full SFT 학습 시작
const trainBaseModel = async (req, res, next) => {
  const {
    version, base_model, source = 'beomi', train_path, val_path,
    epochs = 3, batch_size = 2, learning_rate = 2e-5, max_len = 1024,
    grad_acc = 8, resume = false
  } = req.body;

  const missing = !version || !base_model || (source === 'custom' && (!train_path || !val_path));
  if (missing) {
    logger.error('❌ 필수 학습 인자 누락');
    return next(createError(400, 'version, base_model, train_path, val_path는 필수입니다.', 'MISSING_FIELDS'));
  }

  const trainLogger = createTrainLogger(version, 'base');
  res.status(202).json({ message: "🚀 Full SFT 학습 시작됨", version });

  trainManager.runTrainPipeline({
    type: 'base',
    version,
    baseModel: base_model,
    source,
    train_path,
    val_path,
    epochs,
    bsz: batch_size,
    lr: learning_rate,
    gradAcc: grad_acc,
    maxLen: max_len,
    resume,
    trainLogger
  })

  .then(result => {
    logger.info(`✅ Full SFT 완료: ${JSON.stringify(result)}`);
    trainLogger.info(`✅ 학습 완료: ${JSON.stringify(result)}`);
  })
  .catch(err => {
    logger.error(`❌ Full SFT 실패: ${err}`);
    trainLogger.error(`❌ 학습 실패: ${err}`);
  });
};

// 🧩 LoRA 학습 시작
const trainLoraAndDeploy = async (req, res, next) => {
  const { version, npc, base_version, merge = false, hyper = {}, target } = req.body;

  if (!version || !npc || !base_version) {
    logger.error('❌ LoRA 학습 필수 인자 누락');
    return next(createError(400, 'version, npc, base_version는 필수입니다.', 'MISSING_FIELDS'));
  }

  const fullVersion = `${npc}-${base_version}.${version}`;
  res.status(202).json({ message: '🚀 LoRA 학습 시작', version: fullVersion, base_version, merge });

  const defaults = { epochs: 3, lr: 2e-4, bsz: 1, gradAcc: 8, maxLen: 1024 };
  const hp = { ...defaults, ...hyper };

  try {
    await trainManager.runTrainPipeline({
      type: 'lora',
      version: fullVersion,
      baseModel: base_version,
      merge,
      target,
      ...hp
    });
    logger.info(`✅ LoRA 학습 완료: ${fullVersion}`);
  } catch (err) {
    logger.error(`❌ LoRA 학습 실패: ${err.message}`);
  }
};

// ✅ 활성 학습 목록 조회
const getActiveTrainings = async (req, res, next) => {
  try {
    const activeTrainings = await getAllActiveTrainings();
    res.status(200).json(activeTrainings); // 배열 형태
  } catch (err) {
    logger.error(`❌ 활성 학습 목록 조회 실패: ${err.message}`);
    next(createError(500, '❌ 활성 학습 목록 조회 실패', 'ACTIVE_TRAINING_FETCH_FAILED'));
  }
};

// 📊 학습 상태 조회
const getTrainingStatus = async (req, res, next) => {
  const { version } = req.params;

  try {
    const status = await getTrainStatus(version);
    if (!status) {
      logger.warn(`⚠️ 학습 상태 없음: ${version}`);
      return res.status(404).json({ message: '❌ 해당 버전의 학습 상태가 없습니다.' });
    }

    res.status(200).json(status);
  } catch (err) {
    logger.error(`❌ 학습 상태 조회 실패: ${err.message}`);
    next(err);
  }
};

// 🛑 학습 강제 종료
const cancelTraining = async (req, res, next) => {
  const { version } = req.body;

  try {
    const success = trainManager.abortProcess(version);
    if (!success) {
      logger.warn(`❌ 학습 프로세스 없음: ${version}`);
      return res.status(404).json({ message: '❌ 해당 버전의 학습 프로세스를 찾을 수 없습니다.' });
    }

    logger.info(`🛑 학습 ${version} 취소됨`);
    res.status(200).json({ message: `🛑 학습 ${version} 취소됨` });
  } catch (err) {
    logger.error(`❌ 학습 취소 실패: ${err.message}`);
    return next(createError(500, '❌ 학습 취소 실패', 'TRAIN_ABORT_FAILED'));
  }
};

module.exports = {
  startFlaskServerAPI,
  stopFlaskServerAPI,
  getFlaskStatus,
  getAvailableVersions,
  getTrainLogList,
  getTrainLogDetail,
  testChatbotResponse,
  evaluateModel,
  changeModelVersion,
  getActiveTrainings,
  getTrainingStatus,
  trainBaseModel,
  trainLoraAndDeploy,
  cancelTraining,
  deleteModel
};
