const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth'); // ✅ auth 미들웨어 추가

// 📦 컨트롤러 함수들
const { 
    saveUnlockedIngredients,
    getUnlockedIngredients,
    saveUserFurniture,
    getUserFurniture,
    saveUserRecords, 
    getUserRecords
  } = require('../controllers/inventoryController');

const DEMO_MODE = process.env.DEMO_MODE === 'True';

// ✅ DEMO_MODE가 꺼져 있을 때만 인증 적용
if (!DEMO_MODE) {
  router.use(auth);
}

// 재료 해금 API
router.post('/unlocked-ingredients', saveUnlockedIngredients); // 해금된 재료 저장
router.get('/unlocked-ingredients', getUnlockedIngredients); // 해금된 재료 불러오기

// 가구 해금 API
router.post('/unlocked-furniture', saveUserFurniture);
router.get('/unlocked-furniture', getUserFurniture);

//
router.post('/unlocked-lp-records', saveUserRecords);
router.get('/unlocked-lp-records', getUserRecords);

module.exports = router;
