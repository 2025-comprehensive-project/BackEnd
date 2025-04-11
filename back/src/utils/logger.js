const winston = require('winston');
const path = require('path');

// 로그 파일 경로
const logDir = path.join(__dirname, '..', '..', 'logs');

const logger = winston.createLogger({
  level: 'info', // 최소 로그 레벨
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // 콘솔 출력
    new winston.transports.File({ filename: `${logDir}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${logDir}/combined.log` })
  ]
});

module.exports = logger;
