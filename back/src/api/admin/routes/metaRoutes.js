const express = require('express');
const router = express.Router();

const adminAuth = require('../../../middlewares/adminAuth'); // 관리자 인증 미들웨어
const {
  addIngredient,
  updateIngredient,
  deleteIngredient,
  addGarnish,
  updateGarnish,
  deleteGarnish
} = require('../controllers/metaController');

// 모든 요청은 관리자 인증 필요
router.use(adminAuth);

// 🧪 재료 관련 라우트
// 재료 추가 (POST /api/admin/meta/ingredients)
router.post('/ingredients', addIngredient);

// 재료 수정 (PATCH /api/admin/meta/ingredients/:ingredient_id)
router.patch('/ingredients/:ingredient_id', updateIngredient);

// 재료 삭제 (DELETE /api/admin/meta/ingredients/:ingredient_id)
router.delete('/ingredients/:ingredient_id', deleteIngredient);

// 🍒 가니시 관련 라우트
// 가니시 추가 (POST /api/admin/meta/garnishes)
router.post('/garnishes', addGarnish);

// 가니시 수정 (PATCH /api/admin/meta/garnishes/:garnish_id)
router.patch('/garnishes/:garnish_id', updateGarnish);

// 가니시 삭제 (DELETE /api/admin/meta/garnishes/:garnish_id)
router.delete('/garnishes/:garnish_id', deleteGarnish);

module.exports = router;
