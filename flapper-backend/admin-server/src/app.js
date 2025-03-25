// src/app.js
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const cocktailRoutes = require('./routes/cocktailRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();

// 공통 미들웨어
app.use(express.json());
app.use(cors()); // CORS 설정

// 라우터 등록
app.use('/api/users', userRoutes);
app.use('/api/cocktails', cocktailRoutes);
app.use('/api/admin', loginRoutes); // 관리자 로그인/기능 라우터

module.exports = app;
