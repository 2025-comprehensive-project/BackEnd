const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');

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
    abv,
    summary,
    comments
  } = req.body;

  try {
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
        ingredient1_id, ingredient1_amount,
        ingredient2_id, ingredient2_amount,
        ingredient3_id, ingredient3_amount,
        ingredient4_id, ingredient4_amount,
        garnish_id, method, glass_type, abv, summary, comments
      ]
    );

    res.status(201).json({ message: '✅ 레시피가 등록되었습니다.', recipe_id: result.insertId });
  } catch (error) {
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
    abv,
    summary,
    comments
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE cocktail_recipe SET
        name = ?,
        ingredient1_id = ?, ingredient1_amount = ?,
        ingredient2_id = ?, ingredient2_amount = ?,
        ingredient3_id = ?, ingredient3_amount = ?,
        ingredient4_id = ?, ingredient4_amount = ?,
        garnish_id = ?,
        method = ?, glass_type = ?, abv = ?, summary = ?, comments = ?
       WHERE recipe_id = ?`,
      [
        name,
        ingredient1_id, ingredient1_amount,
        ingredient2_id, ingredient2_amount,
        ingredient3_id, ingredient3_amount,
        ingredient4_id, ingredient4_amount,
        garnish_id, method, glass_type, abv, summary, comments,
        recipe_id
      ]
    );

    if (result.affectedRows === 0) {
      return next(createError(404, '❌ 레시피를 찾을 수 없습니다.', 'RECIPE_NOT_FOUND'));
    }

    res.json({ message: '✅ 레시피가 수정되었습니다.' });
  } catch (error) {
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
  const userId = req.params.user_id; // parameter에서 userId 추출

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

module.exports = {
  addCocktail,
  updateCocktail,
  deleteCocktail,
  getUserCocktails
};
