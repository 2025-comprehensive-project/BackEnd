// src/routes/admin/userRoutes.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../../../middlewares/adminAuth');

// 컨트롤러 함수들
const {
  getAllUsers,
  getUserInfo,
  getUserDialogs,
  updateUserInfo
} = require('../controllers/userManagementController');

// 전체 라우터 보호
router.use(adminAuth);

// 명세 기반 라우트

// 1. 전체 유저 목록 조회
// GET /api/admin/users
router.get('/', getAllUsers);

// 2. 특정 유저 슬롯 정보 조회
// GET /api/admin/users/:user_id/saves/:slot_id
router.get('/:user_id/saves/:slot_id', getUserInfo);

// 3. 특정 유저의 대화 로그 조회
// GET /api/admin/users/:user_id/dialogs?slot_id=...
router.get('/:user_id/dialogs', getUserDialogs);

// 4. 유저 정보 수정
// PATCH /api/admin/users/:user_id/saves/:slot_id
router.patch('/:user_id/saves/:slot_id', updateUserInfo);

module.exports = router;
