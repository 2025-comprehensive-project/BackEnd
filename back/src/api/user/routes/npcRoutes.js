const express = require('express');
const router = express.Router();
const npcController = require('../controllers/npcController');

// NPC 대화 요청
router.post('/chat', npcController.talkToNpc);

module.exports = router;
