// src/api/admin/routes/aiRoutes.js

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// 11) 전이학습 요청
// POST /api/admin/ai/train/:npc_id
router.post('/train/:npc_id', aiController.requestTraining);

// 12) 챗봇 상세 조회
// GET /api/admin/ai/:npc_id
router.get('/:npc_id', aiController.getNpcAiDetails);

// 13) 유저 별 학습 상태 조회
// GET /api/admin/ai/user/:user_id
router.get('/user/:user_id', aiController.getUserAiStatus);

// 14) 챗봇 버전 변경
// PATCH /api/admin/ai/version/:npc_id
router.patch('/version/:npc_id', aiController.updateAiVersion);

// 15) 하이퍼파라미터 수정 후 학습 요청
// POST /api/admin/ai/train/:npc_id/params
router.post('/train/:npc_id/params', aiController.trainWithParams);

module.exports = router;
