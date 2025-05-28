const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator'); // ✅ 추가
const logger = require('../../../utils/logger'); // ✅ 추가

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

  console.log('user_id:', user_id, 'slot_id:', slot_id);

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
      LEFT JOIN user_furniture uf ON us.user_id = uf.user_id AND us.slot_id = uf.slot_id
      LEFT JOIN furniture f ON uf.furniture_id = f.furniture_id
      LEFT JOIN user_long_playing_record ulp ON us.user_id = ulp.user_id AND us.slot_id = ulp.slot_id
      LEFT JOIN long_playing_record lp ON ulp.record_id = lp.record_id
      WHERE us.user_id = ? AND us.slot_id = ?
      GROUP BY 
        us.save_id, us.user_id, u.name, us.slot_id, us.play_time, us.chapter, us.in_game_day,
        us.money, us.reputation_score, us.saved_at
    `, [user_id, slot_id]);

    if (rows.length === 0 || !rows[0].save_id) {
      return next(createError(404, '❌ 세이브 데이터가 없습니다.', 'SAVE_NOT_FOUND'));
    }

    res.json(rows[0]);
  } catch (error) {
    logger.error('❌ 세이브 정보 조회 실패:', error); // ✅ 로거로 기록
    next(createError(500, '세이브 정보 조회 실패', 'FETCH_SAVE_FAILED'));
  }
};

// 3. 특정 유저 대화 로그 조회
// controllers/adminUserController.js
const getUserDialogs = async (req, res, next) => {
  const { user_id } = req.params;
  const { slot_id, npc_id } = req.query;

  if (!slot_id) {
    return next(createError(400, 'slot_id는 필수입니다.', 'MISSING_SLOT_ID'));
  }

  try {
    // 🔹 NPC별 조회인 경우: 세션 ID 먼저 찾고 세션 전체 로그 조회
    if (npc_id) {
      const [sessionRows] = await db.query(
        `SELECT DISTINCT session_id
         FROM user_dialogs
         WHERE user_id = ? AND slot_id = ? AND npc_id = ?`,
        [user_id, slot_id, npc_id]
      );

      if (sessionRows.length === 0) return res.json([]);

      const sessionIds = sessionRows.map(r => r.session_id);
      const placeholders = sessionIds.map(() => '?').join(', ');

      const [logs] = await db.query(
        `SELECT *
         FROM user_dialogs
         WHERE user_id = ? AND slot_id = ? AND session_id IN (${placeholders})
         ORDER BY created_at ASC`,
        [user_id, slot_id, ...sessionIds]
      );

      return res.json(logs);
    }

    // 🔸 기본: 전체 슬롯 로그 조회 (NPC 구분 없이)
    const [rows] = await db.query(
      `SELECT *
       FROM user_dialogs
       WHERE user_id = ? AND slot_id = ?
       ORDER BY created_at ASC`,
      [user_id, slot_id]
    );

    res.json(rows);
  } catch (error) {
    logger.error('❌ 대화 로그 조회 실패:', error);
    next(createError(500, '대화 로그 조회 실패', 'FETCH_DIALOG_FAILED'));
  }
};

// 4. 특정 유저 대화 로그 삭제
const deleteUserDialog = async (req, res, next) => {
  const { user_id } = req.params;
  const { log_pairs } = req.body;

  if (!Array.isArray(log_pairs) || log_pairs.length === 0) {
    return next(createError(400, 'log_pairs는 필수입니다.', 'MISSING_LOG_PAIRS'));
  }

  try {
    // 평탄화하여 전체 log_id 조회
    const flatIds = log_pairs.flat();
    const placeholders = flatIds.map(() => '?').join(', ');

    const [logs] = await db.query(
      `SELECT log_id, speaker, session_id, created_at
       FROM user_dialogs
       WHERE user_id = ? AND log_id IN (${placeholders})`,
      [user_id, ...flatIds]
    );

    const logsById = Object.fromEntries(logs.map(log => [log.log_id, log]));

    const validDeleteIds = [];

    for (const [id1, id2] of log_pairs) {
      const a = logsById[id1];
      const b = logsById[id2];

      if (!a || !b) continue;

      const sameSession = a.session_id === b.session_id;
      const oneUserOneNpc = (
        (a.speaker === 'user' && b.speaker === 'npc') ||
        (a.speaker === 'npc' && b.speaker === 'user')
      );

      if (sameSession && oneUserOneNpc) {
        validDeleteIds.push(id1, id2);
      }
    }

    if (validDeleteIds.length === 0) {
      return res.status(400).json({
        message: '❌ 유효한 대화 쌍이 없습니다. 삭제되지 않았습니다.',
        deleted_log_ids: []
      });
    }

    const deletePlaceholders = validDeleteIds.map(() => '?').join(', ');
    await db.query(
      `DELETE FROM user_dialogs
       WHERE user_id = ? AND log_id IN (${deletePlaceholders})`,
      [user_id, ...validDeleteIds]
    );

    res.json({
      message: `${validDeleteIds.length / 2}세트 (${validDeleteIds.length}줄) 삭제 완료`,
      deleted_log_ids: validDeleteIds
    });
  } catch (err) {
    logger.error('❌ 대화 쌍 삭제 실패:', err);
    next(createError(500, '대화 쌍 삭제 실패', 'DELETE_LOG_PAIRS_FAILED'));
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
  deleteUserDialog,
  updateUserInfo
};
