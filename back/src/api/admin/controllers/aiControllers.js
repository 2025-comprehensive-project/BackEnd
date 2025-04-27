const { spawn } = require('child_process');
const path = require('path');
const createError = require('../../../utils/errorCreator');
const logger = require('../../../utils/logger');
const { generateFromFlask } = require('../../../services/chatbotProxy');
const axios = require('axios'); // Flask 서버와의 통신용

let flaskProcess = null;

const startFlaskServer = (req, res, next) => {
  if (flaskProcess) {
    return next(createError(400, '❌ Flask 서버가 이미 실행 중입니다.', 'FLASK_ALREADY_RUNNING'));
  }

  const flaskScriptPath = path.join(__dirname, '../../../../../ai/chatbot/server/llama_server.py');

  try {
    flaskProcess = spawn('python', [flaskScriptPath], {
      env: { ...process.env, PORT: '50003' },
      detached: true
    });

    flaskProcess.stdout.on('data', (data) => {
      logger.info(`[Flask] ${data.toString().trim()}`);
    });

    flaskProcess.stderr.on('data', (data) => {
      const text = data.toString().trim();
      if (text.toLowerCase().includes('error') || text.includes('Traceback')) {
        logger.error(`❌ [Flask Error] ${text}`);
      } else {
        logger.warn(`⚠️ [Flask Warning] ${text}`);
      }
    });

    flaskProcess.on('close', (code) => {
      logger.warn(`Flask 서버 종료됨. 종료 코드: ${code}`);
      flaskProcess = null;
    });

    return res.status(200).json({ message: '✅ Flask 서버 시작됨.' });
  } catch (err) {
    logger.error('❌ [Flask 서버 실행 오류]', err);
    return next(createError(500, '❌ Flask 서버 실행 실패', 'FLASK_START_FAILED'));
  }
};

const stopFlaskServer = (req, res, next) => {
  if (!flaskProcess) {
    return next(createError(400, '⚠️ 실행 중인 Flask 서버가 없습니다.', 'FLASK_NOT_RUNNING'));
  }

  try {
    process.kill(-flaskProcess.pid);
    flaskProcess = null;
    logger.info('🛑 Flask 서버 정상 종료됨.');
    return res.status(200).json({ message: '🛑 Flask 서버 종료됨.' });
  } catch (err) {
    logger.error('[Flask 서버 종료 오류]', err);
    return next(createError(500, 'Flask 서버 종료 실패', 'FLASK_STOP_FAILED'));
  }
};

const getFlaskStatus = async (req, res, next) => {
  try {
    const response = await axios.get('http://localhost:50003/status');
    logger.info(`📡 Flask 상태 확인: ${JSON.stringify(response.data)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    logger.error('[Flask 상태 확인 오류]', err);
    return next(createError(500, '❌ Flask 상태 조회 실패', 'FLASK_STATUS_ERROR'));
  }
};

const testChatbotResponse = async (req, res, next) => {
  const { npc_id } = req.params;
  const { prompt } = req.body;

  if (!npc_id || !prompt) {
    return next(createError(400, '❌ npc_id와 prompt는 필수입니다.', 'MISSING_FIELDS'));
  }

  try {
    const responseText = await generateFromFlask(prompt);
    return res.status(200).json({
      npc_id,
      prompt,
      response: responseText
    });
  } catch (err) {
    logger.error('❌ Flask 테스트 실패:', err);
    return next(createError(500, '❌ Flask 테스트 실패', 'FLASK_TEST_FAILED'));
  }
};

const changeBaseModelVersion = async (req, res, next) => {
  const { version } = req.body;

  if (!version) {
    return next(createError(400, 'version 필드가 필요합니다.', 'MISSING_FIELDS'));
  }

  try {
    const response = await axios.patch('http://localhost:50003/set-version', {
      version
    });

    res.status(200).json({
      message: `✅ Flask 서버의 베이스 모델 버전이 ${version}(으)로 변경되었습니다.`,
      flaskResponse: response.data
    });
  } catch (err) {
    logger.error('❌ Flask 모델 버전 변경 실패:', err.message || err);
    return next(createError(500, '❌ 베이스 모델 버전 변경 실패', 'FLASK_VERSION_CHANGE_FAILED'));
  }
};

const trainBaseModel = (req, res, next) => {
    const {
      version = "v1.1",
      data_path = ".ai/chatbot/data/train.jsonl",
      val_path = ".ai/chatbot/data/val.jsonl",
      epochs = 3,
      batch_size = 4,
      learning_rate = 5e-5
    } = req.body;
  
    const scriptPath = path.join(__dirname, '../../../../../ai/chatbot/trainer/llama_train.py');
  
    try {
      const trainProcess = spawn('python', [scriptPath], {
        env: {
          ...process.env,
          VERSION: version,
          TRAIN_PATH: data_path,
          VAL_PATH: val_path,
          EPOCHS: String(epochs),
          BATCH_SIZE: String(batch_size),
          LR: String(learning_rate)
        }
      });
  
      trainProcess.stdout.on('data', (data) => {
        logger.info(`[Train] ${data.toString().trim()}`);
      });
  
      trainProcess.stderr.on('data', (data) => {
        const text = data.toString().trim();
        if (text.toLowerCase().includes('error') || text.includes('Traceback')) {
          logger.error(`❌ [Train Error] ${text}`);
        } else {
          logger.warn(`⚠️ [Train Warning] ${text}`);
        }
      });
  
      trainProcess.on('close', (code) => {
        if (code === 0) {
          logger.info(`✅ 모델 학습 완료 (버전: ${version})`);
          return res.status(200).json({
            message: `✅ 모델 학습 완료 및 저장됨: ../models/base/${version}`,
            version
          });
        } else {
          logger.error(`❌ 학습 프로세스 종료 코드: ${code}`);
          return next(createError(500, '❌ 베이스 모델 학습 실패', 'TRAIN_BASE_MODEL_FAILED'));
        }
      });
    } catch (err) {
      logger.error('❌ 트레이너 실행 실패:', err);
      return next(createError(500, '❌ 학습 트리거 실패', 'TRAIN_PROCESS_ERROR'));
    }
};

module.exports = {
  startFlaskServer,
  stopFlaskServer,
  getFlaskStatus,
  testChatbotResponse,
  changeBaseModelVersion,
  trainBaseModel
};
