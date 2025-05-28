const express = require('express'); // Express 프레임워크를 사용하여 서버를 구축합니다.
const cors = require('cors'); // CORS 미들웨어, 다른 도메인에서의 요청을 허용합니다.
const morgan = require('morgan'); // HTTP 요청 로깅을 위한 미들웨어

const client = require('./config/redisClient'); // Redis 클라이언트 가져오기
const apiRoutes = require('./api');
const errorHandler = require('./middlewares/errorHandler');
const { logger } = require('./utils/logger'); // Winston 인스턴스 가져오기
const path = require('path'); // 경로 관련 모듈

const app = express();

// Morgan + Winston 연동
// morgan은 HTTP 요청 로깅을 위한 미들웨어입니다.
// Winston은 로그를 파일에 기록하는 라이브러리입니다.
app.use(
  morgan(':remote-addr :method :url :status :res[content-length] - :user-agent', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

// 공통 미들웨어
app.use(express.json());

//app.use(cors()); // 모든 도메인에서의 요청을 허용합니다.

app.use(cors({
  origin: 'http://localhost:3000', // local host:3000에서 오는 요청을 허용합니다, 리액트 native 연결용?
  credentials: true
}));

// API 라우터
app.use('/api', apiRoutes);

// 전역 에러 핸들러
// 모든 라우터보다 마지막에 위치해야 합니다.
// 이 미들웨어는 모든 요청에 대해 발생할 수 있는 에러를 처리합니다.
app.use(errorHandler);

const buildPath = path.join(__dirname, '../frontend/build');

app.use(express.static(buildPath));

// 🚨 path-to-regexp-safe fallback 처리
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

module.exports = { app, client };
