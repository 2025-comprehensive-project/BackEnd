const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth'); // ✅ auth 미들웨어 추가

// 📦 컨트롤러 함수들
const { 
    loadSaveData
  } = require('../controllers/saveController');

router.post('/load', auth, loadSaveData); // 세이브 데이터 불러오기

module.exports = router;
