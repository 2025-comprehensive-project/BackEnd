const express = require('express');
const router = express.Router();

const cocktailRoutes = require('./routes/adminCocktailRoutes');
const userRoutes = require('./routes/userManagementRoutes');
const loginRoutes = require('./routes/adminLoginRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminMetaRoutes = require('./routes/adminMetaRoutes');

router.use('/', loginRoutes); // 로그인 관련 라우트

router.use('/cocktails', cocktailRoutes); // 칵테일 레시피 관리 라우트
router.use('/users', userRoutes); // 사용자 관리 라우트
router.use('/ai', aiRoutes); // AI 관련 라우트 (Flask 서버 관리)

router.use('/meta', adminMetaRoutes); // 재료 및 가니시 관리 라우트

module.exports = router;
