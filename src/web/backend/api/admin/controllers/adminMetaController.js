const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');
const { logger } = require('../../../utils/logger');   // ✅ logger 추가

/* ───────── 재료(Ingredient) ───────── */

/** 재료 추가 */
const addIngredient = async (req, res, next) => {
  const { name, sweetness, sourness, bitterness, abv, description, note_categories } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1) ingredient 테이블 삽입
    const [result] = await conn.query(
      `INSERT INTO ingredient (name, sweetness, sourness, bitterness, abv, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, sweetness, sourness, bitterness, abv, description]
    );
    const ingredient_id = result.insertId;

    // 2) note_category 매핑
    let categories = note_categories;
    if (typeof categories === 'string') categories = categories.split(',').map(s => s.trim());

    if (Array.isArray(categories)) {
      for (const categoryName of categories) {
        const [[row]] = await conn.query(
          `SELECT note_category_id FROM note_category WHERE name = ?`,
          [categoryName]
        );
        if (!row) {
          await conn.rollback();
          logger.warn(`Invalid note category (‘${categoryName}’) during ingredient add`);
          return next(createError(400, `❌ 존재하지 않는 향미 카테고리입니다: ${categoryName}`, 'INVALID_NOTE_CATEGORY'));
        }
        await conn.query(
          `INSERT INTO ingredient_note (ingredient_id, note_category_id) VALUES (?, ?)`,
          [ingredient_id, row.note_category_id]
        );
      }
    }

    await conn.commit();
    logger.info(`Ingredient added (id=${ingredient_id}, name=${name})`);
    res.status(201).json({ message: '✅ 재료가 추가되었습니다.', ingredient_id: ingredient_id });
  } catch (err) {
    await conn.rollback();
    logger.error('ADD_INGREDIENT_FAILED', err);
    next(createError(500, '❌ 재료 추가 중 오류', 'ADD_INGREDIENT_FAILED'));
  } finally {
    conn.release();
  }
};

/** 재료 수정 */
const updateIngredient = async (req, res, next) => {
  const { ingredient_id } = req.params;
  const { name, sweetness, sourness, bitterness, abv, description, note_categories } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1) 기본 정보 수정
    await conn.query(
      `UPDATE ingredient
       SET name = ?, sweetness = ?, sourness = ?, bitterness = ?, abv = ?, description = ?
       WHERE ingredient_id = ?`,
      [name, sweetness, sourness, bitterness, abv, description, ingredient_id]
    );

    // 2) 기존 향미 매핑 제거 후 재삽입
    await conn.query(`DELETE FROM ingredient_note WHERE ingredient_id = ?`, [ingredient_id]);

    let categories = note_categories;
    if (typeof categories === 'string') categories = categories.split(',').map(s => s.trim());

    if (Array.isArray(categories)) {
      for (const categoryName of categories) {
        const [[row]] = await conn.query(
          `SELECT note_category_id FROM note_category WHERE name = ?`,
          [categoryName]
        );
        if (!row) {
          await conn.rollback();
          logger.warn(`Invalid note category (‘${categoryName}’) during ingredient update`);
          return next(createError(400, `❌ 존재하지 않는 향미 카테고리입니다: ${categoryName}`, 'INVALID_NOTE_CATEGORY'));
        }
        await conn.query(
          `INSERT INTO ingredient_note (ingredient_id, note_category_id) VALUES (?, ?)`,
          [ingredient_id, row.note_category_id]
        );
      }
    }

    await conn.commit();
    logger.info(`Ingredient updated (id=${ingredient_id}, name=${name})`);
    res.json({ message: '✅ 재료 정보가 수정되었습니다.' });
  } catch (err) {
    await conn.rollback();
    logger.error('UPDATE_INGREDIENT_FAILED', err);
    next(createError(500, '❌ 재료 수정 오류', 'UPDATE_INGREDIENT_FAILED'));
  } finally {
    conn.release();
  }
};

/** 재료 삭제 */
const deleteIngredient = async (req, res, next) => {
  const { ingredient_id } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM ingredient WHERE ingredient_id = ?`,
      [ingredient_id]
    );

    if (result.affectedRows === 0) {
      logger.warn(`Ingredient not found (id=${ingredient_id})`);
      return next(createError(404, '❌ 삭제할 재료가 존재하지 않습니다.', 'INGREDIENT_NOT_FOUND'));
    }

    logger.info(`Ingredient deleted (id=${ingredient_id})`);
    res.json({ message: '✅ 재료가 삭제되었습니다.' });
  } catch (err) {
    logger.error('DELETE_INGREDIENT_FAILED', err);
    next(createError(500, '❌ 재료 삭제 오류', 'DELETE_INGREDIENT_FAILED'));
  }
};

/* ───────── 가니시(Garnish) ───────── */

/** 가니시 추가 */
const addGarnish = async (req, res, next) => {
  let { garnish_name, note_category } = req.body;

  if (Array.isArray(note_category)) note_category = note_category[0];
  else if (typeof note_category === 'string') note_category = note_category.trim();

  try {
    const [[row]] = await db.query(
      `SELECT note_category_id FROM note_category WHERE name = ?`,
      [note_category]
    );

    if (!row) {
      logger.warn(`Invalid note category (‘${note_category}’) during garnish add`);
      return next(createError(400, '❌ 존재하지 않는 향미 카테고리입니다.', 'INVALID_NOTE_CATEGORY'));
    }

    await db.query(
      `INSERT INTO garnish_type (name, note_category_id) VALUES (?, ?)`,
      [garnish_name, row.note_category_id]
    );

    logger.info(`Garnish added (name=${garnish_name})`);
    res.status(201).json({ message: '✅ 가니시가 추가되었습니다.' });
  } catch (err) {
    logger.error('ADD_GARNISH_FAILED', err);
    next(createError(500, '❌ 가니시 추가 오류', 'ADD_GARNISH_FAILED'));
  }
};

/** 가니시 수정 */
const updateGarnish = async (req, res, next) => {
  const { garnish_id } = req.params;
  let { garnish_name, note_category } = req.body;

  if (Array.isArray(note_category)) note_category = note_category[0];
  else if (typeof note_category === 'string') note_category = note_category.trim();

  try {
    const [[row]] = await db.query(
      `SELECT note_category_id FROM note_category WHERE name = ?`,
      [note_category]
    );

    if (!row) {
      logger.warn(`Invalid note category (‘${note_category}’) during garnish update`);
      return next(createError(400, '❌ 존재하지 않는 향미 카테고리입니다.', 'INVALID_NOTE_CATEGORY'));
    }

    const [result] = await db.query(
      `UPDATE garnish_type SET name = ?, note_category_id = ? WHERE garnish_id = ?`,
      [garnish_name, row.note_category_id, garnish_id]
    );

    if (result.affectedRows === 0) {
      logger.warn(`Garnish not found (id=${garnish_id})`);
      return next(createError(404, '❌ 해당 가니시가 존재하지 않습니다.', 'GARNISH_NOT_FOUND'));
    }

    logger.info(`Garnish updated (id=${garnish_id}, name=${garnish_name})`);
    res.json({ message: '✅ 가니시 정보가 수정되었습니다.' });
  } catch (err) {
    logger.error('UPDATE_GARNISH_FAILED', err);
    next(createError(500, '❌ 가니시 수정 오류', 'UPDATE_GARNISH_FAILED'));
  }
};

/** 가니시 삭제 */
const deleteGarnish = async (req, res, next) => {
  const { garnish_id } = req.params;

  try {
    await db.query(`DELETE FROM garnish_type WHERE garnish_id = ?`, [garnish_id]);
    logger.info(`Garnish deleted (id=${garnish_id})`);
    res.json({ message: '✅ 가니시가 삭제되었습니다.' });
  } catch (err) {
    logger.error('DELETE_GARNISH_FAILED', err);
    next(createError(500, '❌ 가니시 삭제 오류', 'DELETE_GARNISH_FAILED'));
  }
};

/* ───────── exports ───────── */
module.exports = {
  addIngredient,
  updateIngredient,
  deleteIngredient,
  addGarnish,
  updateGarnish,
  deleteGarnish
};
