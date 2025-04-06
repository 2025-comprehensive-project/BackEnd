// src/app.js
const express = require('express');
const cors = require('cors');

const apiRoutes = require('./api');  // ✅ 라우트 통합 포인트
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 공통 미들웨어
app.use(express.json());
app.use(cors());

// API 라우터
app.use('/api', apiRoutes);

// 전역 에러 핸들러
app.use(errorHandler);

module.exports = app;