// src/routes/admin/adminCocktailRoutes.js

const express = require('express');
const router = express.Router();

const adminAuth = require('../../../middlewares/adminAuth'); // JWT 인증 미들웨어
const {
  addCocktail,
  updateCocktail,
  deleteCocktail,
  getUserCocktails
} = require('../controllers/adminCocktailController');

// 🔐 모든 요청은 관리자 인증 필요
router.use(adminAuth);

// 새로운 레시피 등록 (POST /api/admin/cocktails)
router.post('/', addCocktail);

// 레시피 수정 (PUT /api/admin/cocktails/:recipe_id)
router.put('/:recipe_id', updateCocktail);

// 레시피 삭제 (DELETE /api/admin/cocktails/:recipe_id)
router.delete('/:recipe_id', deleteCocktail);

// 특정 유저의 시그니처 칵테일 목록 조회
// GET /api/admin/cocktails/:user_id/signature
router.get('/:user_id/signature', getUserCocktails);

module.exports = router;
