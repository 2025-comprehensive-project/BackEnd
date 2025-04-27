// src/api/user/routes/dialogRoutes.js
const express = require('express');
const router = express.Router();
const { 
    saveUserDialogLogs,
    generateUserChat
  } = require('../controllers/dialogController');

const auth = require('../../../middlewares/userAuth');

router.use(auth); // 모든 라우트에 auth 미들웨어 적용

router.post('/', saveUserDialogLogs);

router.post('/:npc_id/chat', generateUserChat);

module.exports = router;
