// src/api/user/routes/userCocktailRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth');
const {
    getUserCocktails,
    createUserCocktail,
    predictUserCocktail
} = require('../controllers/userCocktailController');

const DEMO_MODE = process.env.DEMO_MODE === 'True';

// ✅ DEMO_MODE가 꺼져 있을 때만 인증 적용
if (!DEMO_MODE) {
  router.use(auth);
}

// 유저 시그니처 칵테일 목록 조회
// GET /api/users/cocktails/signature
router.get('/signature', getUserCocktails);

// 유저 시그니처 칵테일 생성
// POST /api/users/cocktails/signature
router.post('/signature', createUserCocktail);

// 예측용 칵테일 맛 분석
// POST /api/user/cocktails/predict
router.post('/predict', predictUserCocktail);

module.exports = router;
