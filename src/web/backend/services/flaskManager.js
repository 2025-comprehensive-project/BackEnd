const { spawn, execSync } = require('child_process');
const path = require('path');
const { logger } = require('../utils/logger');

let flaskProcess = null;

const FLASK_PORT = 50003;
const ROOT_DIR = path.resolve(__dirname, '../../..');
const FLASK_SCRIPT = path.join(ROOT_DIR, 'ai/chatbot/server/llama_server.py');

function findProcessByPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`).toString();
    const lines = output.trim().split('\n');
    if (lines.length > 0) {
      const parts = lines[0].trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      return pid;
    }
  } catch {}
  return null;
}

function killProcess(pid) {
  try {
    execSync(`taskkill /PID ${pid} /F`);
    logger.info(`✅ 프로세스 ${pid} 종료 성공`);
  } catch (err) {
    logger.error(`❌ 프로세스 종료 실패: ${err.message}`);
  }
}

async function startFlaskServer() {
  const existingPid = findProcessByPort(FLASK_PORT);
  if (existingPid) {
    logger.warn(`⚠️ 포트 ${FLASK_PORT}를 점유 중인 프로세스 감지 (PID: ${existingPid}) → 종료 시도`);
    killProcess(existingPid);
  }

  flaskProcess = spawn('python', [FLASK_SCRIPT], {
    env: { ...process.env, PORT: FLASK_PORT },
    shell: true
  });

  flaskProcess.stdout.on('data', (data) => {
    const text = data.toString().trim();
    logger.info(`[Flask] ${text}`);
    if (/Flask Server is running/i.test(text)) {
      logger.info('✅ Flask 서버 실행 완료');
    }
  });

  flaskProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    logger.error(`[Flask Error] ${msg}`);
  });

  flaskProcess.on('close', (code) => {
    logger.warn(`🛑 Flask 종료됨 (code ${code})`);
    flaskProcess = null;
  });
}

async function stopFlaskServer() {
  const pid = findProcessByPort(FLASK_PORT);
  if (pid) {
    logger.info(`📍 Flask PID: ${pid}`);
    killProcess(pid);
  } else {
    logger.warn('⚠️ 종료할 Flask 프로세스 없음');
  }
}

async function isFlaskRunning() {
  const pid = findProcessByPort(FLASK_PORT);
  return !!pid;
}

module.exports = {
  startFlaskServer,
  stopFlaskServer,
  isFlaskRunning
};
