// src/api/user/controllers/userCocktailController.js
const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');

// 1. 유저 시그니처 레시피 조회
const getUserCocktails = async (req, res, next) => {
    const userId = req.user.userId; // JWT에서 userId 추출
    // const recipeId = req.params; // URL 파라미터에서 recipeId 추출
  
    try {
      const [rows] = await db.query(`
        SELECT
          cr.recipe_id,
          cr.name,
  
          i1.name AS ingredient1,
          cr.ingredient1_amount,
          i2.name AS ingredient2,
          cr.ingredient2_amount,
          i3.name AS ingredient3,
          cr.ingredient3_amount,
          i4.name AS ingredient4,
          cr.ingredient4_amount,
          g.name AS garnish,
  
          cr.method,
          cr.glass_type,
          cr.abv,
          cr.summary,
          cr.comments,
          cr.creator_id,
          cr.created_at
        FROM cocktail_recipe cr
        LEFT JOIN ingredient i1 ON cr.ingredient1_id = i1.ingredient_id
        LEFT JOIN ingredient i2 ON cr.ingredient2_id = i2.ingredient_id
        LEFT JOIN ingredient i3 ON cr.ingredient3_id = i3.ingredient_id
        LEFT JOIN ingredient i4 ON cr.ingredient4_id = i4.ingredient_id
        LEFT JOIN garnish_type g ON cr.garnish_id = g.garnish_id
        WHERE cr.creator_id = ?
        ORDER BY cr.created_at DESC
      `, [userId]);
  
      if (rows.length === 0) {
        return res.json([]); // 빈 배열 반환
      }
  
      res.json(rows);
    } catch (err) {
        console.error('❌ 유저 시그니처 칵테일 조회 실패:', err);
        next(createError(500, '유저 시그니처 칵테일 조회 실패', 'GET_MY_COCKTAILS_FAILED'));
    }
  };

module.exports = { getUserCocktails };
