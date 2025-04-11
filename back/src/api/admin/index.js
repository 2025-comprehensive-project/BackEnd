const express = require('express');
const router = express.Router();

const cocktailRoutes = require('./routes/cocktailRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
//const aiRoutes = require('./routes/aiRoutes');
const metaRoutes = require('./routes/metaRoutes');

router.use('/', loginRoutes); // 로그인 관련 라우트

router.use('/cocktails', cocktailRoutes); // 칵테일 레시피 관련 라우트
router.use('/users', userRoutes); // 사용자 관련 라우트

//router.use('/ai', aiRoutes);

router.use('/meta', metaRoutes); // 재료 및 가니시 관련 퍼블릭 라우트

module.exports = router;
