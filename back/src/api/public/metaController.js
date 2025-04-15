const db = require('../../config/dbConnect');
const createError = require('../../utils/errorCreator');

// 1. 전체 칵테일 레시피 목록 조회
const getAllCocktails = async (req, res, next) => {
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
      WHERE cr.creator_id IS NULL
      ORDER BY cr.recipe_id ASC
    `);

    res.json(rows);
  } catch (error) {
    next(createError(500, '❌ 칵테일 목록 조회 실패', 'GET_ALL_COCKTAILS_FAILED'));
  }
};

// 2. 특정 레시피 조회
const getCocktailById = async (req, res, next) => {
  const { recipe_id } = req.params;

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
      WHERE cr.recipe_id = ? AND cr.creator_id IS NULL
    `, [recipe_id]);

    if (rows.length === 0) {
      return next(createError(404, '❌ 레시피를 찾을 수 없습니다.', 'RECIPE_NOT_FOUND'));
    }

    res.json(rows[0]);
  } catch (error) {
    next(createError(500, '❌ 레시피 조회 실패', 'GET_COCKTAIL_FAILED'));
  }
};

// 3.재료 목록
const getIngredients = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT 
          i.ingredient_id,
          i.name,
          i.sweetness,
          i.sourness,
          i.bitterness,
          i.abv,
          i.description,
          GROUP_CONCAT(n.name SEPARATOR ', ') AS note_categories
      FROM 
          ingredient i
      LEFT JOIN ingredient_note inote ON i.ingredient_id = inote.ingredient_id
      LEFT JOIN note_category n ON inote.note_category_id = n.note_category_id
      GROUP BY 
          i.ingredient_id, i.name, i.sweetness, i.sourness, i.bitterness, i.abv, i.description
      ORDER BY i.ingredient_id ASC
    `);

    res.json(rows);
  } catch (err) {
    next(createError(500, '❌ 재료 목록 조회 실패', 'GET_INGREDIENTS_FAILED'));
  }
};

// 4.재료 단일 조회
const getIngredientById = async (req, res, next) => {
  const { ingredient_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
          i.ingredient_id,
          i.name,
          i.sweetness,
          i.sourness,
          i.bitterness,
          i.abv,
          i.description,
          GROUP_CONCAT(n.name SEPARATOR ', ') AS note_categories
      FROM 
          ingredient i
      LEFT JOIN ingredient_note inote ON i.ingredient_id = inote.ingredient_id
      LEFT JOIN note_category n ON inote.note_category_id = n.note_category_id
      WHERE i.ingredient_id = ?
      GROUP BY i.ingredient_id, i.name, i.sweetness, i.sourness, i.bitterness, i.abv, i.description
    `, [ingredient_id]);

    if (rows.length === 0) {
      return next(createError(404, '❌ 재료를 찾을 수 없습니다.', 'INGREDIENT_NOT_FOUND'));
    }

    res.json(rows[0]);
  } catch (err) {
    next(createError(500, '❌ 재료 상세 조회 실패', 'GET_INGREDIENT_FAILED'));
  }
};

// 5.가니시 목록
const getGarnishes = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT 
          g.garnish_id,
          g.name AS garnish_name,
          nc.name AS note_category
      FROM garnish_type g
      JOIN note_category nc ON g.note_category_id = nc.note_category_id
      ORDER BY g.garnish_id ASC
    `);

    res.json(rows);
  } catch (err) {
    next(createError(500, '❌ 가니시 목록 조회 실패', 'GET_GARNISHES_FAILED'));
  }
};

// 가니시 상세 조회
const getGarnishById = async (req, res, next) => {
  const { garnish_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
          g.garnish_id,
          g.name AS garnish_name,
          nc.name AS note_category
      FROM garnish_type g
      JOIN note_category nc ON g.note_category_id = nc.note_category_id
      WHERE g.garnish_id = ?
    `, [garnish_id]);

    if (rows.length === 0) {
      return next(createError(404, '❌ 가니시를 찾을 수 없습니다.', 'GARNISH_NOT_FOUND'));
    }

    res.json(rows[0]);
  } catch (err) {
    next(createError(500, '❌ 가니시 상세 조회 실패', 'GET_GARNISH_FAILED'));
  }
};

// 6.향미 카테고리 목록
const getNoteCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT note_category_id, name FROM note_category ORDER BY note_category_id ASC');
    res.json(rows);
  } catch (err) {
    next(createError(500, '❌ 향미 카테고리 목록 조회 실패', 'GET_NOTE_CATEGORIES_FAILED'));
  }
};

module.exports = {
  getAllCocktails,
  getCocktailById,
  getIngredients,
  getIngredientById,
  getGarnishes,
  getGarnishById,
  getNoteCategories
};
