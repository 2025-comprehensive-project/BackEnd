const axios = require('axios');
const db = require('../../../config/dbConnect');
const redis = require('../../../config/redisClient');
const createError = require('../../../utils/errorCreator');
const { logger } = require('../../../utils/logger');
const { exportChatML } = require('../../../utils/exportChatML');
const { runTrainPipeline } = require('../../../services/trainManager');
const dayjs = require('dayjs');
const path = require('path');

const baseDir = path.join(__dirname, "../../../../../ai/chatbot");
const dataDir = path.join(baseDir, "data");

const DEMO_MODE = process.env.DEMO_MODE === 'True';

const loadData = async (req, res, next) => {
  const user_id = DEMO_MODE ? 1 : req.user?.user_id;
  const { slot_id } = req.body;

  if (!slot_id) {
    return next(createError(400, '❌ slot_id는 필수입니다.', 'MISSING_SLOT_ID'));
  }

  try {
    const [rows] = await db.query(
      `SELECT 
        us.save_id, us.user_id, u.name AS user_name, us.slot_id, us.play_time,
        us.chapter, us.in_game_day AS date, us.money, us.reputation_score, us.saved_at
      FROM user_save us
      JOIN user u ON us.user_id = u.user_id
      WHERE us.user_id = ? AND us.slot_id = ?`,
      [user_id, slot_id]
    );

    if (rows.length === 0) {
      return next(createError(404, '❌ 해당 세이브 데이터를 찾을 수 없습니다.', 'SAVE_NOT_FOUND'));
    }

    res.json(rows[0]);
  } catch (err) {
    logger.error('❌ 세이브 데이터 불러오기 오류:', err);
    next(createError(500, '❌ 세이브 데이터 불러오기 실패', 'LOAD_ERROR'));
  }
};

const saveData = async (req, res, next) => {
  const user_id = DEMO_MODE ? 1 : req.user?.user_id;
  const { slot_id, play_time, chapter, in_game_day, money, reputation_score } = req.body;

  if (!slot_id) {
    return next(createError(400, '❌ slot_id는 필수입니다.', 'MISSING_SLOT_ID'));
  }

  // ✅ 1. 세이브 정보 저장
  try {
    await db.query(`
      INSERT INTO user_save (user_id, slot_id, play_time, chapter, in_game_day, money, reputation_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        play_time = VALUES(play_time), chapter = VALUES(chapter),
        in_game_day = VALUES(in_game_day), money = VALUES(money),
        reputation_score = VALUES(reputation_score), saved_at = CURRENT_TIMESTAMP
    `, [user_id, slot_id, play_time, chapter, in_game_day, money, reputation_score]);
  } catch (err) {
    logger.error('❌ 세이브 정보 저장 실패:', err);
    return next(createError(500, '❌ 세이브 저장 실패', 'SAVE_FAILED'));
  }

  // ✅ 2. 응답 먼저 리턴 (비동기 처리 시작)
  const savedAt = dayjs().tz('Asia/Seoul').format();
  res.status(200).json({
    message: '✅ 세이브 완료 (학습은 백그라운드 처리)',
    slot_id,
    saved_at: savedAt
  });

  // ✅ 3. 비동기 백그라운드 작업 시작
  try {
    const { data: npcVersionMap } = await axios.get(`${process.env.FLASK_BASE_URL}/npc-version`);
    const conn = await db.getConnection();
    await conn.beginTransaction();

    for (const npc_id of Object.keys(npcVersionMap)) {
      try {
        const redisKey = `flapper:dialog:${user_id}:${slot_id}:${npc_id}`;
        const logs = await redis.lRange(redisKey, 0, -1);
        if (logs.length === 0) continue;

        const parsed = logs.map(JSON.parse);
        const version_tag = npcVersionMap[npc_id];

        const grouped = {};
        for (const log of parsed) {
          const seq = log.sequence || 1;
          if (!grouped[seq]) grouped[seq] = [];
          grouped[seq].push(log);
        }

        for (const [sequence, group] of Object.entries(grouped)) {
          const { in_game_day } = group[0];
          const session_id = `${in_game_day}_${npc_id}_${slot_id}_${sequence}`;

          for (const log of group) {
            const { speaker, content, timestamp } = log;
            const utc = new Date(timestamp);
            const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
            const cleanTimestamp = kst.toISOString().slice(0, 19).replace('T', ' ');

            await conn.query(`
              INSERT INTO user_dialogs (
                session_id, user_id, slot_id, npc_id,
                speaker, message, created_at, is_training_data, version_tag
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
            `, [
              session_id, user_id, slot_id, npc_id,
              speaker, content, cleanTimestamp, version_tag
            ]);
          }
        }

        await redis.del(redisKey);

        const match = version_tag.match(/^(.+)-v(\d+\.\d+)\.(\d+)$/);
        if (!match) continue;

        const baseVersion = `v${match[2]}`;
        const adapterVersion = version_tag;
        const adapterPath = path.join(baseDir, "models", "rola", adapterVersion);
        const dataPath = path.join(dataDir, 'rola', npc_id, `${user_id}_${slot_id}.jsonl`);
        const saveVersion = `${npc_id}-${user_id}_${slot_id}`;

        const { lastTimestamp } = await exportChatML(user_id, slot_id, npc_id, dataPath);
        if (!lastTimestamp) continue;

        await runTrainPipeline({
          type: "rola",
          version: saveVersion,
          baseModel: baseVersion,
          adapter: adapterPath,
          datapath: dataPath,
          epochs: 3,
          lr: 2e-4,
          bsz: 2,
          gradAcc: 8,
          maxLen: 1024,
          merge: false,
          resume: false
        });

        await db.query(`
          UPDATE user_dialogs
          SET is_training_data = 0
          WHERE user_id = ? AND slot_id = ? AND npc_id = ? AND created_at <= ?
        `, [user_id, slot_id, npc_id, lastTimestamp]);

        logger.info(`[RoLA][${npc_id}] 학습 및 마킹 완료`);
      } catch (npcErr) {
        logger.warn(`[RoLA][${npc_id}] 백그라운드 처리 실패 → 무시: ${npcErr.message}`);
      }
    }

    await conn.commit();
    conn.release();
  } catch (outerErr) {
    logger.warn("⚠️ 백그라운드 대화 로그 처리 실패 (세이브는 성공)");
  }
};

module.exports = {
  loadData,
  saveData
};
