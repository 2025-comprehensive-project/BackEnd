const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth'); // ✅ auth 미들웨어 추가

// 📦 컨트롤러 함수들
const { 
    saveUnlockedIngredients,
    getUnlockedIngredients,
    saveUserFurniture,
    getUserFurniture
  } = require('../controllers/saveController');

// 재료 해금 API
router.post('/unlocked-ingredients', auth, saveUnlockedIngredients); // 해금된 재료 저장
router.get('/unlocked-ingredients', auth, getUnlockedIngredients); // 해금된 재료 불러오기

// 가구 해금 API
router.post('/unlocked-furniture', auth, saveUserFurniture);
router.get('/unlocked-furniture', auth, getUserFurniture);

//
router.post('/unlocked-lp-records', auth, saveUserRecords);
router.get('/unlocked-lp-records', auth, getUserRecords);

module.exports = router;
