const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');

// 인벤토리 데이터 저장 (해금된 재료)
// 해금된 재료를 저장하는 API 핸들러
const saveUnlockedIngredients = async (req, res, next) => {
  const user_id = req.user.userId;
  const { slot_id, ingredient_ids } = req.body;

  if (!slot_id || !Array.isArray(ingredient_ids)) {
    return next(createError(400, 'slot_id와 ingredient_ids 배열이 필요합니다.', 'MISSING_FIELDS'));
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 기존 데이터 삭제
    await conn.query(
      `DELETE FROM unlocked_ingredient WHERE user_id = ? AND slot_id = ?`,
      [user_id, slot_id]
    );

    // 새로 insert
    for (const ingredient_id of ingredient_ids) {
      await conn.query(
        `INSERT INTO unlocked_ingredient (user_id, slot_id, ingredient_id) VALUES (?, ?, ?)`,
        [user_id, slot_id, ingredient_id]
      );
    }

    await conn.commit();
    res.status(201).json({ message: '✅ 재료 해금 상태가 저장되었습니다.' });
  } catch (err) {
    await conn.rollback();
    console.error('❌ 재료 해금 저장 실패:', err);
    next(createError(500, '재료 해금 저장 실패', 'SAVE_INGREDIENT_UNLOCK_FAILED'));
  } finally {
    conn.release();
  }
};

// 인벤토리 데이터 불러오기 (해금된 재료)
// 해금된 재료를 불러오는 API 핸들러
const getUnlockedIngredients = async (req, res, next) => {
  const user_id = req.user.userId;
  const { slot_id } = req.query;

  if (!slot_id) {
    return next(createError(400, 'slot_id는 필수입니다.', 'MISSING_SLOT_ID'));
  }

  try {
    const [rows] = await db.query(
      `SELECT i.ingredient_id, i.name, i.sweetness, i.sourness, i.bitterness, i.abv, i.description
       FROM unlocked_ingredient ui
       JOIN ingredient i ON ui.ingredient_id = i.ingredient_id
       WHERE ui.user_id = ? AND ui.slot_id = ?
       ORDER BY i.ingredient_id`,
      [user_id, slot_id]
    );

    res.json(rows); // 배열로 반환
  } catch (err) {
    console.error('❌ 재료 해금 조회 실패:', err);
    next(createError(500, '재료 해금 조회 실패', 'GET_INGREDIENT_UNLOCK_FAILED'));
  }
};

// 가구 해금 상태 저장 API 핸들러
// 가구 해금 상태를 저장하는 API 핸들러
const saveUserFurniture = async (req, res, next) => {
  const user_id = req.user.userId;
  const { slot_id, furniture_ids } = req.body;

  if (!slot_id || !Array.isArray(furniture_ids)) {
    return next(createError(400, 'slot_id와 furniture_ids 배열이 필요합니다.', 'MISSING_FIELDS'));
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    await conn.query(
      `DELETE FROM user_furniture WHERE user_id = ? AND slot_id = ?`,
      [user_id, slot_id]
    );

    for (const furniture_id of furniture_ids) {
      await conn.query(
        `INSERT INTO user_furniture (user_id, slot_id, furniture_id)
         VALUES (?, ?, ?)`,
        [user_id, slot_id, furniture_id]
      );
    }

    await conn.commit();
    res.status(201).json({ message: '✅ 가구 보유 상태가 저장되었습니다.' });
  } catch (err) {
    await conn.rollback();
    console.error('❌ 가구 저장 실패:', err);
    next(createError(500, '가구 저장 실패', 'SAVE_FURNITURE_FAILED'));
  } finally {
    conn.release();
  }
};

// 가구 해금 상태 조회 API 핸들러
// 가구 해금 상태를 조회하는 API 핸들러
const getUserFurniture = async (req, res, next) => {
  const user_id = req.user.userId;
  const { slot_id } = req.query;

  if (!slot_id) {
    return next(createError(400, 'slot_id는 필수입니다.', 'MISSING_SLOT_ID'));
  }

  try {
    const [rows] = await db.query(
      `SELECT f.furniture_id, f.name, f.description, f.price
       FROM user_furniture uf
       JOIN furniture f ON uf.furniture_id = f.furniture_id
       WHERE uf.user_id = ? AND uf.slot_id = ?
       ORDER BY f.furniture_id`,
      [user_id, slot_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ 가구 조회 실패:', err);
    next(createError(500, '가구 조회 실패', 'GET_FURNITURE_FAILED'));
  }
};

// LP 보유 상태 저장 API 핸들러
// LP 보유 상태를 저장하는 API 핸들러
const saveUserRecords = async (req, res, next) => {
    const user_id = req.user.userId;
    const { slot_id, record_ids } = req.body;
  
    if (!slot_id || !Array.isArray(record_ids)) {
      return next(createError(400, 'slot_id와 record_ids 배열이 필요합니다.', 'MISSING_FIELDS'));
    }
  
    const conn = await db.getConnection();
    await conn.beginTransaction();
  
    try {
      await conn.query(
        `DELETE FROM user_record WHERE user_id = ? AND slot_id = ?`,
        [user_id, slot_id]
      );
  
      for (const record_id of record_ids) {
        await conn.query(
          `INSERT INTO user_record (user_id, slot_id, record_id)
           VALUES (?, ?, ?)`,
          [user_id, slot_id, record_id]
        );
      }
  
      await conn.commit();
      res.status(201).json({ message: '✅ LP 보유 상태가 저장되었습니다.' });
    } catch (err) {
      await conn.rollback();
      console.error('❌ LP 저장 실패:', err);
      next(createError(500, 'LP 저장 실패', 'SAVE_RECORD_FAILED'));
    } finally {
      conn.release();
    }
  };

// LP 보유 상태 조회 API 핸들러
// LP 보유 상태를 조회하는 API 핸들러
const getUserRecords = async (req, res, next) => {
    const user_id = req.user.userId;
    const { slot_id } = req.query;
  
    if (!slot_id) {
      return next(createError(400, 'slot_id는 필수입니다.', 'MISSING_SLOT_ID'));
    }
  
    try {
      const [rows] = await db.query(
        `SELECT r.record_id, r.name, r.description, r.price
         FROM user_record ur
         JOIN long_playing_record r ON ur.record_id = r.record_id
         WHERE ur.user_id = ? AND ur.slot_id = ?
         ORDER BY r.record_id`,
        [user_id, slot_id]
      );
  
      res.json(rows);
    } catch (err) {
      console.error('❌ LP 조회 실패:', err);
      next(createError(500, 'LP 조회 실패', 'GET_RECORD_FAILED'));
    }
};

module.exports = {
  saveUnlockedIngredients,
  getUnlockedIngredients,
  saveUserFurniture,
  getUserFurniture,
  saveUserRecords,
  getUserRecords,
};
