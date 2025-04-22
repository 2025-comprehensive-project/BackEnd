const express = require('express');
const router = express.Router();
const adminAuth = require('../../middlewares/adminAuth');
const {
  getAllCocktails,
  getAllSignatureCocktails,
  getCocktailById,
  getIngredients,
  getIngredientById,
  getGarnishes,
  getGarnishById,
  getNoteCategories
} = require('./metaController');

//public API 라우터, 인증 미들웨어 필요 없음
//router.use(adminAuth);

// 전체 칵테일 레시피 조회 (유저 칵테일 제외) (GET /api/public/cocktails)
router.get('/cocktails', getAllCocktails);

// 시그니처 칵테일 전체 조회 (GET /api/public/cocktails/signature)
router.get('/cocktails/signature', getAllSignatureCocktails);

// 특정 칵테일 레시피 조회 (GET /api/public/cocktails/:recipe_id)
router.get('/cocktails/:recipe_id', getCocktailById);

// 전체 재료 목록 조회 (GET /api/public/ingredients)
router.get('/ingredients', getIngredients);

// 특정 재료 상세 조회 (GET /api/public/ingredients/:ingredient_id)
router.get('/ingredients/:ingredient_id', getIngredientById );

// 전체 가니시 목록 조회 (GET /api/public/garnishes)
router.get('/garnishes', getGarnishes);

// 특정 가니시 상세 조회 (GET /api/public/garnishes/:garnish_id)
router.get('/garnishes/:garnish_id', getGarnishById);

// 향미 카테고리 목록 조회 (GET /api/public/note-categories)
router.get('/note-categories', getNoteCategories); 

module.exports = router;
