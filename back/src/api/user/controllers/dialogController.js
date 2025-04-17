// src/api/user/controllers/dialogController.js
const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');
const logger = require('../../../utils/logger'); // 로거 유틸리티

const DEMO_MODE = process.env.DEMO_MODE === 'true';

const saveUserDialogLogs = async (req, res, next) => {
  const user_id = DEMO_MODE ? 1 : req.user?.user_id;
  const { session_id, slot_id, npc_id, raw } = req.body;

  if (!session_id || !slot_id || !npc_id || !raw) {
    return next(createError(400, '❌ session_id, slot_id, npc_id, raw는 필수입니다.', 'MISSING_FIELDS'));
  }

  const lines = raw.split('\n').filter(Boolean);

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    for (const line of lines) {
      const [speaker, ...messageParts] = line.split(':');
      const message = messageParts.join(':').trim();

      if (!['user', 'npc'].includes(speaker?.trim()) || !message) {
        logger.warn('⚠️ 잘못된 라인 건너뜀:', line);
        continue;
      }

      await conn.query(
        `INSERT INTO user_dialogs (
          session_id, user_id, slot_id, npc_id,
          speaker, message
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          session_id,
          user_id,
          slot_id,
          npc_id,
          speaker.trim(),
          message
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ message: '✅ 대화 로그 저장 완료' });
  } catch (err) {
    await conn.rollback();
    logger.error('❌ 대화 로그 저장 실패:', err);
    next(createError(500, '❌ 대화 로그 저장 실패', 'SAVE_DIALOG_FAILED'));
  } finally {
    conn.release();
  }
};

module.exports = {
  saveUserDialogLogs
};
