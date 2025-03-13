const express = require('express');
const { loginAdmin } = require('../controllers/loginController');

const router = express.Router();

// 🔹 관리자 로그인 엔드포인트
router.post('/login', loginAdmin);

module.exports = router;
