// src/routes/user/npcRoutes.js
const express = require('express');
const router = express.Router();

// 임시 테스트용 엔드포인트
router.get('/test', (req, res) => {
  res.send('NPC Chat route is working!');
});

module.exports = router;