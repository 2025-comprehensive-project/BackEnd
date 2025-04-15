const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');

const loadData = async (req, res, next) => {
  const user_id = req.user.userId; // ✅ JWT에서 추출
  const { load_id } = req.body;

  if (!load_id) {
    return next(createError(400, 'load_id는 필수입니다.', 'MISSING_SLOT_ID'));
  }

  try {
    const [rows] = await db.query(
      `SELECT money, in_game_day AS date, play_time, chapter, reputation_score
       FROM user_save
       WHERE user_id = ? AND slot_id = ?`,
      [user_id, load_id]
    );

    if (rows.length === 0) {
      return next(createError(404, '해당 세이브 데이터를 찾을 수 없습니다.', 'SAVE_NOT_FOUND'));
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('❌ 세이브 데이터 불러오기 오류:', err);
    next(createError(500, '세이브 데이터 불러오기 실패', 'LOAD_ERROR'));
  }
};

const saveData = async (req, res, next) => {
  const user_id = req.user.userId;
  const {
    slot_id,
    play_time,
    chapter,
    in_game_day,
    money,
    reputation_score
  } = req.body;

  if (!slot_id) {
    return next(createError(400, 'slot_id는 필수입니다.', 'MISSING_SLOT_ID'));
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO user_save (user_id, slot_id, play_time, chapter, in_game_day, money, reputation_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        play_time = VALUES(play_time),
        chapter = VALUES(chapter),
        in_game_day = VALUES(in_game_day),
        money = VALUES(money),
        reputation_score = VALUES(reputation_score),
        saved_at = CURRENT_TIMESTAMP
      `,
      [user_id, slot_id, play_time, chapter, in_game_day, money, reputation_score]
    );

    res.status(200).json({ message: '✅ 세이브 데이터가 저장되었습니다.' });
  } catch (err) {
    console.error('❌ 세이브 데이터 저장 실패:', err);
    next(createError(500, '세이브 저장 실패', 'SAVE_FAILED'));
  }
};

module.exports = {
  loadData,
  saveData
};
