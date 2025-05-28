const express = require('express');
const router = express.Router();
const {
  startFlaskServerAPI,
  stopFlaskServerAPI,
  getFlaskStatus,
  getAvailableVersions,
  getTrainLogList,
  getTrainLogDetail,
  testChatbotResponse,
  evaluateModel,
  changeModelVersion,
  getActiveTrainings,
  getTrainingStatus,
  trainBaseModel,
  trainLoraAndDeploy,
  cancelTraining,
  deleteModel
} = require('../controllers/aiController');

const auth = require('../../../middlewares/adminAuth');
router.use(auth); // 🔐 관리자 인증

// Flask 서버 제어
router.post('/start', startFlaskServerAPI);
router.post('/stop', stopFlaskServerAPI);
router.get('/status', getFlaskStatus);

// 모델 버전 조회
router.get('/version', getAvailableVersions); 

// 모델 버전 제어 
router.patch('/version', changeModelVersion);

// 모델 삭제
router.delete('/version', deleteModel); 

// 챗봇 테스트 (관리자용)
router.post('/chat-test/:npc_id', testChatbotResponse);

// 모델 평가
router.post('/evaluate', evaluateModel); // 베이스 모델 평가

// 모델 학습
router.post('/train/base', trainBaseModel);         // 베이스 전체 학습 (풀 SFT)
router.post('/train/lora', trainLoraAndDeploy);     // ✅ LoRA 학습 및 (선택적) 병합

// 학습 상태 조회
router.get('/train/active', getActiveTrainings); // 현재 활성화된 학습 세션 정보 조회
router.get('/train/status/:version', getTrainingStatus); 

// 학습 로그 조회
router.get('/train/logs', getTrainLogList); // 학습 로그 목록 조회
router.get('/train/logs/:type/:filename', getTrainLogDetail); // 학습 로그 상세 조회

// 학습 취소
router.post('/train/cancel', cancelTraining); // 학습 취소

module.exports = router;     