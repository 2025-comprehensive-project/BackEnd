// src/api/user/routes/dialogRoutes.js
const express = require('express');
const router = express.Router();
const { 
    saveUserDialogLogs,
    generateUserChat
  } = require('../controllers/dialogController');

const auth = require('../../../middlewares/userAuth');

const DEMO_MODE = process.env.DEMO_MODE === 'True';

// ✅ DEMO_MODE가 꺼져 있을 때만 인증 적용
if (!DEMO_MODE) {
  router.use(auth);
}

router.post('/', saveUserDialogLogs);

router.post('/:npc_id/chat', generateUserChat);

module.exports = router;
