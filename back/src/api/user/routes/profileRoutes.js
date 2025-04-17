const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth'); // ✅ auth 미들웨어 추가
const {
    getOwnProfile
} = require('../controllers/profileController');

//router.use(auth); // 모든 라우트에 auth 미들웨어 적용

// 유저 프로필 조회
router.get('/:id', getOwnProfile);

module.exports = router;
