const express = require('express');
const router = express.Router();


const userLoginRoutes = require('./userLoginRoutes');
const npcRoutes = require('./npcRoutes');
const profileRoutes = require('./profileRoutes');

router.use('/', userLoginRoutes); // 로그인 관련 라우트
router.use('/npc', npcRoutes);          // → /api/user/npc/...
router.use('/profile', profileRoutes);  // → /api/user/profile/...

module.exports = router;
