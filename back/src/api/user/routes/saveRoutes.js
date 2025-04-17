const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth'); // ✅ auth 미들웨어 추가

// 📦 컨트롤러 함수들
const { 
    loadData,
    saveData
  } = require('../controllers/saveController');

//router.use(auth); // 모든 라우트에 auth 미들웨어 적용

router.post('/load', loadData); // 세이브 데이터 불러오기

router.post('/save', saveData); // 세이브 데이터 저장하기

module.exports = router;
