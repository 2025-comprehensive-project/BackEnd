const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator'); // ✅ 추가

// 1. 전체 유저 목록 조회
const getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM user ORDER BY registered_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    next(createError(500, '유저 목록 조회 실패', 'FETCH_USERS_FAILED'));
  }
};

// 2. 특정 유저 슬롯 정보 상세 조회 (유저 이름, 세이브 정보, 구매 정보 포함)
const getUserInfo = async (req, res, next) => {
  const { user_id, slot_id } = req.params;
  try {
    const [rows] = await db.query(`
    SELECT 
      us.save_id,
      us.user_id,
      u.name AS user_name,
      us.slot_id,
      us.play_time,
      us.chapter,
      us.in_game_day,
      us.money,
      us.reputation_score,
      us.saved_at,

      -- 유저가 보유한 가구 목록 (이름 기준)
      GROUP_CONCAT(DISTINCT f.name ORDER BY f.furniture_id SEPARATOR ', ') AS furniture_list,

      -- 유저가 보유한 LP 목록 (이름 기준)
      GROUP_CONCAT(DISTINCT lp.name ORDER BY lp.record_id SEPARATOR ', ') AS lp_list

      FROM user_save us

      JOIN user u ON us.user_id = u.user_id

      LEFT JOIN user_furniture uf 
        ON us.user_id = uf.user_id AND us.slot_id = uf.slot_id
      LEFT JOIN furniture f 
        ON uf.furniture_id = f.furniture_id

      LEFT JOIN user_long_playing_record ulp 
        ON us.user_id = ulp.user_id AND us.slot_id = ulp.slot_id
      LEFT JOIN long_playing_record lp 
        ON ulp.record_id = lp.record_id

      GROUP BY 
        us.save_id, us.user_id, u.name, us.slot_id, us.play_time, us.chapter, us.in_game_day,
        us.money, us.reputation_score, us.saved_at;
    `, [user_id, slot_id]);

    if (rows.length === 0) {
      return next(createError(404, '세이브 데이터를 찾을 수 없습니다.', 'SAVE_NOT_FOUND'));
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ 세이브 정보 조회 실패:', error);
    next(createError(500, '세이브 정보 조회 실패', 'FETCH_SAVE_FAILED'));
  }
};

// 3. 특정 유저 대화 로그 조회
const getUserDialogs = async (req, res, next) => {
  const { user_id } = req.params;
  const { slot_id } = req.query;

  if (!slot_id) {
    return next(createError(400, 'slot_id는 필수입니다.', 'MISSING_SLOT_ID'));
  }

  try {
    const [rows] = await db.query(
      `SELECT log_id, session_id, npc_id, speaker, message, created_at, emotion_tag, version_tag
       FROM user_dialogs
       WHERE user_id = ? AND slot_id = ?
       ORDER BY created_at ASC`,
      [user_id, slot_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('❌ 대화 로그 조회 실패:', error);
    next(createError(500, '대화 로그 조회 실패', 'FETCH_DIALOG_FAILED'));
  }
};

// 4. 유저 정보 수정
const updateUserInfo = async (req, res, next) => {
  const { user_id, slot_id } = req.params;
  const { reputation_score, money } = req.body;

  if (reputation_score == null || money == null) {
    return next(createError(400, 'reputation_score와 money는 필수입니다.', 'MISSING_FIELDS'));
  }

  try {
    const [result] = await db.query(
      'UPDATE user_save SET reputation_score = ?, money = ? WHERE user_id = ? AND slot_id = ?',
      [reputation_score, money, user_id, slot_id]
    );

    if (result.affectedRows === 0) {
      return next(createError(404, '일치하는 세이브 데이터가 없습니다.', 'SAVE_NOT_FOUND'));
    }

    res.json({ message: '유저 세이브 정보가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('❌ 유저 정보 수정 실패:', error);
    next(createError(500, '유저 정보 수정 실패', 'UPDATE_USER_FAILED'));
  }
};

module.exports = {
  getAllUsers,
  getUserInfo,
  getUserDialogs,
  updateUserInfo
};
