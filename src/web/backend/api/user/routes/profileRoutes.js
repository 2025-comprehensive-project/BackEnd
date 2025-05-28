const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth'); // ✅ auth 미들웨어 추가
const {
    getOwnProfile
} = require('../controllers/profileController');

const DEMO_MODE = process.env.DEMO_MODE === 'True';

// ✅ DEMO_MODE가 꺼져 있을 때만 인증 적용
if (!DEMO_MODE) {
  router.use(auth);
}

// 유저 프로필 조회
router.get('/:id', getOwnProfile);

module.exports = router;
