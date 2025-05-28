// 에러 핸들러 미들웨어
// 이 미들웨어는 Express 애플리케이션에서 발생하는 에러를 처리하고,
// 에러 로그를 파일에 기록하며, 클라이언트에게 에러 메시지를 반환합니다.
// 이 미들웨어는 모든 라우터보다 마지막에 위치해야 합니다.

const { logger } = require('../utils/logger');

module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || null;
  const message = err.message || '서버 내부 오류';

  const errorMsg = `${req.method} ${req.originalUrl} - ${message}`;

  // 콘솔 & 파일 로그 기록
  logger.error(`[${status}] ${errorMsg}`);
  if (err.stack) logger.error(err.stack);

  // 에러 응답 반환
  res.status(status).json({
    success: false,
    status,     // 응답 코드 포함 (301~305도 포함)
    code,       // 내부 커스텀 코드 (문자열)
    message
  });
};

