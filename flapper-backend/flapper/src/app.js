// src/app.js
const express = require('express');
const cors = require('cors');

const adminLoginRoutes = require('./routes/admin/loginRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');
const adminCocktailRoutes = require('./routes/admin/cocktailRoutes');

const userNpcRoutes = require('./routes/user/npcRoutes');
// 필요한 경우 추가적으로: const userProfileRoutes = require('./routes/user/profileRoutes');

const app = express();

// 공통 미들웨어
app.use(express.json());
app.use(cors());

// ✅ 관리자용 API
app.use('/api/admin/login', adminLoginRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/cocktails', adminCocktailRoutes);

// ✅ 유저용 API
app.use('/api/user/npc-chat', userNpcRoutes);
// app.use('/api/user/profile', userProfileRoutes);

module.exports = app;
