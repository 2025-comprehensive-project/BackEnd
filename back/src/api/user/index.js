const express = require('express');
const router = express.Router();

const userLoginRoutes = require('./routes/userLoginRoutes');
//const npcRoutes = require('./routes/npcRoutes');
//const profileRoutes = require('./routes/profileRoutes');
const saveRoutes = require('./routes/saveRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cocktailRoutes = require('./routes/userCocktailRoutes');

router.use('/', userLoginRoutes);               // 로그인 관련 라우트

//router.use('/npc', npcRoutes);                // /api/users/npc/...
//router.use('/profile', profileRoutes);          // /api/users/profile/...

router.use('/saves', saveRoutes);               // 세이브 관련 라우트

router.use('/inventory', inventoryRoutes);      // 아이템 해금 관련 라우트 (재료, 가니시 등)
router.use('/cocktails', cocktailRoutes);      // 시그니처 칵테일 관련 라우트

module.exports = router;
