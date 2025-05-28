const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 로그 파일 디렉토리
const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 공통 포맷
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: () => {
      return new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul'
      });
    }
  }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// ✅ 일반 시스템 로거
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ]
});

// ✅ 학습 로그 전용 로거 생성기 (덮어쓰기 방식)
const createTrainLogger = (version, type = 'base') => {
  const typeDir = path.join(logDir, 'train', type);
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
  }

  const logPath = path.join(typeDir, `train_${version}.log`);

  if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
  }

  return winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
      new winston.transports.File({ filename: logPath })
    ]
  });
};

module.exports = {
  logger,
  createTrainLogger
};
