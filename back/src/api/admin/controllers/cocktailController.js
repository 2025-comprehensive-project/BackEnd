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

module.exports = {
  addCocktail,
  updateCocktail,
  deleteCocktail
};
