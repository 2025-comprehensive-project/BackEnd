const express = require('express');
const router = express.Router();
const {
  startFlaskServer,
  stopFlaskServer,
  getFlaskStatus,
  testChatbotResponse,
  changeBaseModelVersion,
  trainBaseModel
} = require('../controllers/aiController');

const auth = require('../../../middlewares/adminAuth');
router.use(auth); // 🔐 관리자 인증

// Flask 서버 제어
router.post('/start', startFlaskServer);
router.post('/stop', stopFlaskServer);
router.get('/status', getFlaskStatus);

// Flask 모델 훈련
router.patch('/set-version', changeBaseModelVersion);
router.post('/train', trainBaseModel);


// Flask 챗봇 테스트 (관리자용)
router.post('/chat-test/:npc_id', testChatbotResponse);

module.exports = router;
