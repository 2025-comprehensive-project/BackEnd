// src/routes/admin/cocktailRoutes.js

const express = require('express');
const router = express.Router();

const adminAuth = require('../../../middlewares/adminAuth'); // JWT 인증 미들웨어
const {
  addCocktail,
  updateCocktail,
  deleteCocktail
} = require('../controllers/cocktailController');

// 🔐 모든 요청은 관리자 인증 필요
router.use(adminAuth);

// 새로운 레시피 등록 (POST /api/admin/cocktails)
router.post('/', addCocktail);

// 레시피 수정 (PUT /api/admin/cocktails/:recipe_id)
router.put('/:recipe_id', updateCocktail);

// 레시피 삭제 (DELETE /api/admin/cocktails/:recipe_id)
router.delete('/:recipe_id', deleteCocktail);

module.exports = router;
