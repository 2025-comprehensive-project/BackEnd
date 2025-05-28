const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth'); // ✅ auth 미들웨어 추가

// 📦 컨트롤러 함수들
const { 
    loadData,
    saveData
  } = require('../controllers/saveController');

const DEMO_MODE = process.env.DEMO_MODE === 'True';

// ✅ DEMO_MODE가 꺼져 있을 때만 인증 적용
if (!DEMO_MODE) {
  router.use(auth);
}

router.post('/load', loadData); // 세이브 데이터 불러오기

router.post('/save', saveData); // 세이브 데이터 저장하기

module.exports = router;
