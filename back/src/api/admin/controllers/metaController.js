const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');

// 재료 추가
const addIngredient = async (req, res, next) => {
  const { name, sweetness, sourness, bitterness, abv, description, note_categories } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const [result] = await conn.query(`
      INSERT INTO ingredient (name, sweetness, sourness, bitterness, abv, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, sweetness, sourness, bitterness, abv, description]);

    const ingredientId = result.insertId;

    let categories = note_categories;
    if (typeof categories === 'string') {
      categories = categories.split(',').map(s => s.trim());
    }

    if (Array.isArray(categories)) {
      for (const categoryName of categories) {
        const [noteRows] = await conn.query(
          `SELECT note_category_id FROM note_category WHERE name = ?`,
          [categoryName]
        );

        if (noteRows.length === 0) {
          await conn.rollback();
          return next(createError(400, `❌ 존재하지 않는 향미 카테고리입니다: ${categoryName}`, 'INVALID_NOTE_CATEGORY'));
        }

        const noteCategoryId = noteRows[0].note_category_id;

        await conn.query(
          `INSERT INTO ingredient_note (ingredient_id, note_category_id)
           VALUES (?, ?)`,
          [ingredientId, noteCategoryId]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ message: '✅ 재료가 추가되었습니다.', ingredient_id: ingredientId });
  } catch (err) {
    await conn.rollback();
    next(createError(500, '❌ 재료 추가 중 오류', 'ADD_INGREDIENT_FAILED'));
  } finally {
    conn.release();
  }
};

// 재료 수정
const updateIngredient = async (req, res, next) => {
  const { ingredient_id } = req.params;
  const { name, sweetness, sourness, bitterness, abv, description, note_categories } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    await conn.query(`
      UPDATE ingredient 
      SET name = ?, sweetness = ?, sourness = ?, bitterness = ?, abv = ?, description = ?
      WHERE ingredient_id = ?
    `, [name, sweetness, sourness, bitterness, abv, description, ingredient_id]);

    await conn.query(`DELETE FROM ingredient_note WHERE ingredient_id = ?`, [ingredient_id]);

    let categories = note_categories;
    if (typeof categories === 'string') {
      categories = categories.split(',').map(s => s.trim());
    }

    if (Array.isArray(categories)) {
      for (const categoryName of categories) {
        const [noteRows] = await conn.query(
          `SELECT note_category_id FROM note_category WHERE name = ?`,
          [categoryName]
        );

        if (noteRows.length === 0) {
          await conn.rollback();
          return next(createError(400, `❌ 존재하지 않는 향미 카테고리입니다: ${categoryName}`, 'INVALID_NOTE_CATEGORY'));
        }

        const noteCategoryId = noteRows[0].note_category_id;

        await conn.query(
          `INSERT INTO ingredient_note (ingredient_id, note_category_id)
           VALUES (?, ?)`,
          [ingredient_id, noteCategoryId]
        );
      }
    }

    await conn.commit();
    res.json({ message: '✅ 재료 정보가 수정되었습니다.' });
  } catch (err) {
    await conn.rollback();
    next(createError(500, '❌ 재료 수정 오류', 'UPDATE_INGREDIENT_FAILED'));
  } finally {
    conn.release();
  }
};

// 재료 삭제
const deleteIngredient = async (req, res, next) => {
  const { ingredient_id } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM ingredient WHERE ingredient_id = ?`,
      [ingredient_id]
    );

    if (result.affectedRows === 0) {
      return next(createError(404, '❌ 삭제할 재료가 존재하지 않습니다.', 'INGREDIENT_NOT_FOUND'));
    }

    res.json({ message: '✅ 재료가 삭제되었습니다.' });
  } catch (err) {
    next(createError(500, '❌ 재료 삭제 오류', 'DELETE_INGREDIENT_FAILED'));
  }
};

// 가니시 추가
const addGarnish = async (req, res, next) => {
  let { name, note_category } = req.body;

  if (Array.isArray(note_category)) {
    note_category = note_category[0];
  } else if (typeof note_category === 'string') {
    note_category = note_category.trim();
  }

  try {
    const [noteRows] = await db.query(
      `SELECT note_category_id FROM note_category WHERE name = ?`,
      [note_category]
    );

    if (noteRows.length === 0) {
      return next(createError(400, '❌ 존재하지 않는 향미 카테고리입니다.', 'INVALID_NOTE_CATEGORY'));
    }

    const noteCategoryId = noteRows[0].note_category_id;

    await db.query(
      `INSERT INTO garnish_type (name, note_category_id)
       VALUES (?, ?)`,
      [name, noteCategoryId]
    );

    res.status(201).json({ message: '✅ 가니시가 추가되었습니다.' });
  } catch (err) {
    next(createError(500, '❌ 가니시 추가 오류', 'ADD_GARNISH_FAILED'));
  }
};

// 가니시 수정
const updateGarnish = async (req, res, next) => {
  const { garnish_id } = req.params;
  let { name, note_category } = req.body;

  if (Array.isArray(note_category)) {
    note_category = note_category[0];
  } else if (typeof note_category === 'string') {
    note_category = note_category.trim();
  }

  try {
    const [noteRows] = await db.query(
      `SELECT note_category_id FROM note_category WHERE name = ?`,
      [note_category]
    );

    if (noteRows.length === 0) {
      return next(createError(400, '❌ 존재하지 않는 향미 카테고리입니다.', 'INVALID_NOTE_CATEGORY'));
    }

    const noteCategoryId = noteRows[0].note_category_id;

    const [result] = await db.query(
      `UPDATE garnish_type SET name = ?, note_category_id = ? WHERE garnish_id = ?`,
      [name, noteCategoryId, garnish_id]
    );

    if (result.affectedRows === 0) {
      return next(createError(404, '❌ 해당 가니시가 존재하지 않습니다.', 'GARNISH_NOT_FOUND'));
    }

    res.json({ message: '✅ 가니시 정보가 수정되었습니다.' });
  } catch (err) {
    next(createError(500, '❌ 가니시 수정 오류', 'UPDATE_GARNISH_FAILED'));
  }
};

// 가니시 삭제
const deleteGarnish = async (req, res, next) => {
  const { garnish_id } = req.params;

  try {
    await db.query(`DELETE FROM garnish_type WHERE garnish_id = ?`, [garnish_id]);
    res.json({ message: '✅ 가니시가 삭제되었습니다.' });
  } catch (err) {
    next(createError(500, '❌ 가니시 삭제 오류', 'DELETE_GARNISH_FAILED'));
  }
};


module.exports = {
  addIngredient,
  updateIngredient,
  deleteIngredient,
  addGarnish,
  updateGarnish,
  deleteGarnish
};
