const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth'); // ✅ auth 미들웨어 추가
const {
    getOwnProfile
} = require('../controllers/profileController');

// 유저 프로필 조회
router.get('/:id', auth, getOwnProfile);

module.exports = router;
