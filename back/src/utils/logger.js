const winston = require('winston');
const path = require('path');

// 로그 파일 경로
const logDir = path.join(__dirname, '..', '..', 'logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
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
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logDir}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${logDir}/combined.log` })
  ]
});

module.exports = logger;
