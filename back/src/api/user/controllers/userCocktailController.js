// src/api/user/controllers/userCocktailController.js
const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');
const logger = require('../../../utils/logger'); // 로거 유틸리티

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// 1. 유저 시그니처 레시피 조회
const getUserCocktails = async (req, res, next) => {
    const user_id = DEMO_MODE ? 1 : req.user?.user_id; // JWT에서 userId 추출
    // const recipe_id = req.params; // URL 파라미터에서 recipeId 추출
  
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
      `, [user_id]);
  
      if (rows.length === 0) {
        return res.json([]); // 빈 배열 반환
      }
  
      res.json(rows);
    } catch (err) {
        logger.error('❌ 유저 시그니처 칵테일 조회 실패:', err);
        next(createError(500, '❌ 유저 시그니처 칵테일 조회 실패', 'GET_MY_COCKTAILS_FAILED'));
    }
  };

  // 2. 유저 시그니처 레시피 저장
  const createUserCocktail = async (req, res, next) => {
    const user_id = req.user.user_id; // JWT에서 추출된 유저 ID
    const {
      name,
      ingredient1_id, ingredient1_amount,
      ingredient2_id, ingredient2_amount,
      ingredient3_id, ingredient3_amount,
      ingredient4_id, ingredient4_amount,
      garnish_id,
      method,
      ice_in_shake,
      glass_type,
      abv,
      summary,
      comment
    } = req.body;
  
    try {
      const [result] = await db.query(`
        INSERT INTO cocktail_recipe (
          name,
          ingredient1_id, ingredient1_amount,
          ingredient2_id, ingredient2_amount,
          ingredient3_id, ingredient3_amount,
          ingredient4_id, ingredient4_amount,
          garnish_id,
          method, ice_in_shake, glass_type,
          abv, summary, comments,
          creator_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name,
        ingredient1_id, ingredient1_amount,
        ingredient2_id, ingredient2_amount,
        ingredient3_id, ingredient3_amount,
        ingredient4_id, ingredient4_amount,
        garnish_id,
        method, ice_in_shake, glass_type,
        abv, summary, comment,
        user_id
      ]);
  
      res.status(201).json({
        message: '✅ 유저 칵테일 레시피 저장 완료',
        recipe_id: result.insertId
      });
    } catch (err) {
      logger.error('❌ 유저 칵테일 레시피 저장 실패:', err);
      next(createError(500, '❌ 유저 칵테일 저장 실패', 'CREATE_MY_COCKTAIL_FAILED'));
    }
  };
  

module.exports = { getUserCocktails, createUserCocktail };
