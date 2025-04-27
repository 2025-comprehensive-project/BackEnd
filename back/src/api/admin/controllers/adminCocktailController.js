const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');
const logger = require('../../../utils/logger');
const { calculateAbv } = require('../../../utils/abvCalculator'); // 도수 계산 유틸리티

// 안전한 null 처리 함수
const safeNull = (v) => {
  return (v === '' || v === undefined) ? null : v;
};

// 1. 레시피 등록
const addCocktail = async (req, res, next) => {
  const {
    name,
    ingredient1_id, ingredient1_amount,
    ingredient2_id, ingredient2_amount,
    ingredient3_id, ingredient3_amount,
    ingredient4_id, ingredient4_amount,
    garnish_id,
    method,
    glass_type,
    summary,
    comments
  } = req.body;

  try {
    // ✅ [1] 필수 재료 체크
    if (!ingredient1_id || !ingredient2_id) {
      logger.error('❌ 필수 재료 체크 실패:', error);
      return next(createError(400, '❌ 1번, 2번 재료는 필수입니다.', 'MISSING_BASE_INGREDIENT'));
    }

    // ✅ [2] 기주 ID(1~8) 체크
    const baseSpiritIds = [1,2,3,4,5,6,7,8];
    if (!baseSpiritIds.includes(Number(ingredient1_id)) || !baseSpiritIds.includes(Number(ingredient2_id))) {
      logger.error('❌ 기주 ID 체크 실패:', error);
      return next(createError(400, '❌ 1번과 2번 재료는 반드시 기주(1~8번)여야 합니다.', 'INVALID_BASE_INGREDIENT'));
    }

    // ✅ [3] 재료 ABV 정보 가져오기
    const ingredientIds = [ingredient1_id, ingredient2_id, ingredient3_id, ingredient4_id].filter(id => id);

    let ingredientInfo = {};
    if (ingredientIds.length > 0) {
      const [ingredientRows] = await db.query(
        `SELECT ingredient_id, abv FROM ingredient WHERE ingredient_id IN (?)`,
        [ingredientIds]
      );
      ingredientRows.forEach(row => {
        ingredientInfo[row.ingredient_id] = { abv: row.abv };
      });
    }

    // ✅ [4] 도수 계산
    const ingredientList = [
      { id: ingredient1_id, amountStr: ingredient1_amount },
      { id: ingredient2_id, amountStr: ingredient2_amount },
      { id: ingredient3_id, amountStr: ingredient3_amount },
      { id: ingredient4_id, amountStr: ingredient4_amount }
    ].filter(item => item.id);

    const calculatedAbv = calculateAbv(ingredientList, ingredientInfo, glass_type);

    // ✅ [5] 레시피 저장
    const [result] = await db.query(
      `INSERT INTO cocktail_recipe
        (name,
         ingredient1_id, ingredient1_amount,
         ingredient2_id, ingredient2_amount,
         ingredient3_id, ingredient3_amount,
         ingredient4_id, ingredient4_amount,
         garnish_id, method, glass_type, abv, summary, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        safeNull(ingredient1_id), safeNull(ingredient1_amount),
        safeNull(ingredient2_id), safeNull(ingredient2_amount),
        safeNull(ingredient3_id), safeNull(ingredient3_amount),
        safeNull(ingredient4_id), safeNull(ingredient4_amount),
        safeNull(garnish_id),
        method,
        glass_type,
        calculatedAbv, 
        summary,
        comments
      ]
    );

    res.status(201).json({ message: '✅ 레시피가 등록되었습니다.', recipe_id: result.insertId });
  } catch (error) {
    logger.error('❌ 레시피 등록 실패:', error);
    next(createError(500, '❌ 레시피 등록 실패', 'ADD_COCKTAIL_FAILED'));
  }
};

// 2. 레시피 수정
const updateCocktail = async (req, res, next) => {
  const { recipe_id } = req.params;
  const {
    name,
    ingredient1_id, ingredient1_amount,
    ingredient2_id, ingredient2_amount,
    ingredient3_id, ingredient3_amount,
    ingredient4_id, ingredient4_amount,
    garnish_id,
    method,
    glass_type,
    summary,
    comments
  } = req.body;

  try {
    // ✅ [1] 필수 재료 체크
    if (!ingredient1_id || !ingredient2_id) {
      return next(createError(400, '❌ 1번, 2번 재료는 필수입니다.', 'MISSING_BASE_INGREDIENT'));
    }

    // ✅ [2] 기주 ID(1~8) 체크
    const baseSpiritIds = [1,2,3,4,5,6,7,8];
    if (!baseSpiritIds.includes(Number(ingredient1_id)) || !baseSpiritIds.includes(Number(ingredient2_id))) {
      return next(createError(400, '❌ 1번과 2번 재료는 반드시 기주(1~8번)여야 합니다.', 'INVALID_BASE_INGREDIENT'));
    }

    // ✅ [3] 재료 ABV 정보 가져오기
    const ingredientIds = [ingredient1_id, ingredient2_id, ingredient3_id, ingredient4_id].filter(id => id);

    let ingredientInfo = {};
    if (ingredientIds.length > 0) {
      const [ingredientRows] = await db.query(
        `SELECT ingredient_id, abv FROM ingredient WHERE ingredient_id IN (?)`,
        [ingredientIds]
      );
      ingredientRows.forEach(row => {
        ingredientInfo[row.ingredient_id] = { abv: row.abv };
      });
    }

    // ✅ [4] 도수 계산
    const ingredientList = [
      { id: ingredient1_id, amountStr: ingredient1_amount },
      { id: ingredient2_id, amountStr: ingredient2_amount },
      { id: ingredient3_id, amountStr: ingredient3_amount },
      { id: ingredient4_id, amountStr: ingredient4_amount }
    ].filter(item => item.id);

    const calculatedAbv = calculateAbv(ingredientList, ingredientInfo, glass_type);

    // ✅ [5] 레시피 수정
    const [result] = await db.query(
      `UPDATE cocktail_recipe SET
        name = ?,
        ingredient1_id = ?, ingredient1_amount = ?,
        ingredient2_id = ?, ingredient2_amount = ?,
        ingredient3_id = ?, ingredient3_amount = ?,
        ingredient4_id = ?, ingredient4_amount = ?,
        garnish_id = ?,
        method = ?, glass_type = ?, abv = ?, summary = ?, \`comments\` = ?
      WHERE recipe_id = ?`,
      [
        name,
        safeNull(ingredient1_id), safeNull(ingredient1_amount),
        safeNull(ingredient2_id), safeNull(ingredient2_amount),
        safeNull(ingredient3_id), safeNull(ingredient3_amount),
        safeNull(ingredient4_id), safeNull(ingredient4_amount),
        safeNull(garnish_id),
        method,
        glass_type,
        calculatedAbv,
        summary,
        comments,
        recipe_id
      ]
    );

    if (result.affectedRows === 0) {
      return next(createError(404, '❌ 레시피를 찾을 수 없습니다.', 'RECIPE_NOT_FOUND'));
    }

    res.json({ message: '✅ 레시피가 수정되었습니다.' });
  } catch (error) {
    logger.error('❌ 레시피 수정 실패:', error);  // ✅ 로거로 기록
    next(createError(500, '❌ 레시피 수정 실패', 'UPDATE_COCKTAIL_FAILED'));
  }
};

// 3. 레시피 삭제
const deleteCocktail = async (req, res, next) => {
  const { recipe_id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM cocktail_recipe WHERE recipe_id = ?',
      [recipe_id]
    );

    if (result.affectedRows === 0) {
      return next(createError(404, '❌ 삭제할 레시피가 존재하지 않습니다.', 'RECIPE_NOT_FOUND'));
    }

    res.json({ message: '✅ 레시피가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    next(createError(500, '❌ 레시피 삭제 실패', 'DELETE_COCKTAIL_FAILED'));
  }
};

// 4. 유저 시그니처 레시피 조회
const getUserCocktails = async (req, res, next) => {
  const userId = req.params.user_id;

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

    res.json(rows); // ✅ 굳이 빈 배열 검사할 필요 없음
  } catch (error) {
    logger.error('❌ 유저 시그니처 칵테일 조회 실패:', error);
    next(createError(500, '유저 시그니처 칵테일 조회 실패', 'GET_MY_COCKTAILS_FAILED'));
  }
};

module.exports = {
  addCocktail,
  updateCocktail,
  deleteCocktail,
  getUserCocktails
};
