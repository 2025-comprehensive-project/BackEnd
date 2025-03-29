const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// 유저 프로필 조회
router.get('/:id', profileController.getUserProfile);

// 유저 정보 업데이트
router.put('/:id', profileController.updateUserProfile);

module.exports = router;
