const express = require('express'); // Express 프레임워크를 사용하여 서버를 구축합니다.
const cors = require('cors'); // CORS 미들웨어, 다른 도메인에서의 요청을 허용합니다.
const morgan = require('morgan'); // HTTP 요청 로깅을 위한 미들웨어

const client = require('./config/redisClient'); // Redis 클라이언트 가져오기
const apiRoutes = require('./api');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger'); // Winston 인스턴스 가져오기

const app = express();

// Morgan + Winston 연동
// morgan은 HTTP 요청 로깅을 위한 미들웨어입니다.
// Winston은 로그를 파일에 기록하는 라이브러리입니다.
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

// 공통 미들웨어
app.use(express.json());
app.use(cors()); 

// API 라우터
app.use('/api', apiRoutes);

// 전역 에러 핸들러
// 모든 라우터보다 마지막에 위치해야 합니다.
// 이 미들웨어는 모든 요청에 대해 발생할 수 있는 에러를 처리합니다.
app.use(errorHandler);

module.exports = app, client;
