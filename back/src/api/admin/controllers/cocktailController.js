const db = require('../../../config/dbConnect');

// 1. 전체 칵테일 레시피 목록 조회
const getAllCocktails = async (req, res) => {
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
      ORDER BY cr.recipe_id ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching cocktails:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// 2. 특정 레시피 조회
const getCocktailById = async (req, res) => {
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
      WHERE cr.recipe_id = ?
    `, [recipe_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: '레시피를 찾을 수 없습니다.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// 3. 레시피 등록
const addCocktail = async (req, res) => {
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

    res.status(201).json({ message: '레시피가 등록되었습니다.', recipe_id: result.insertId });
  } catch (error) {
    console.error('❌ Error creating cocktail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. 레시피 수정
const updateCocktail = async (req, res) => {
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
      return res.status(404).json({ message: '레시피를 찾을 수 없습니다.' });
    }

    res.json({ message: '레시피가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('❌ Error updating cocktail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. 레시피 삭제
const deleteCocktail = async (req, res) => {
  const { recipe_id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM cocktail_recipe WHERE recipe_id = ?',
      [recipe_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '삭제할 레시피가 존재하지 않습니다.' });
    }

    res.json({ message: '레시피가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('❌ Error deleting cocktail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getAllCocktails,
  getCocktailById,
  addCocktail,
  updateCocktail,
  deleteCocktail
};
