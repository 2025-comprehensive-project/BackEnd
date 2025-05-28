// src/api/user/controllers/dialogController.js
const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');
const axios = require('axios');
const redis = require('../../../config/redisClient'); // Redis 연결
const { logger } = require('../../../utils/logger'); // 로거 유틸리티
const { generateFromFlask } = require('../../../services/chatbotProxy'); // Flask 서버와의 통신 서비스

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const DEMO_MODE = process.env.DEMO_MODE === 'True';

const generateUserChat = async (req, res, next) => {
  const user_id = DEMO_MODE ? 1 : req.user?.user_id;
  const { npc_id } = req.params;
  const { prompt, session_id } = req.body;

  if (!session_id || !npc_id || !prompt) {
    return next(createError(400, '❌ npc_id, session_id, prompt는 필수입니다.', 'MISSING_FIELDS'));
  }

  try {
    // 1. session_id 파싱
    const [dayStr, npcFromSession, slotStr, seqStr] = session_id.split('_');
    const in_game_day = parseInt(dayStr, 10);
    const slot_id = parseInt(slotStr, 10);
    const sequence = parseInt(seqStr, 10);

    if (npcFromSession !== npc_id) {
      return next(createError(400, `❌ session_id의 npc_id(${npcFromSession})와 URL의 npc_id(${npc_id})가 일치하지 않습니다.`, 'MISMATCH_NPC'));
    }

    // 2. 대화 생성
    const responseText = await generateFromFlask(prompt, npc_id, { user_id, slot_id });

    // 3. 버전 정보 조회
    const npcVersions = await axios.get(`${process.env.FLASK_BASE_URL}/npc-version`);
    const version_tag = npcVersions.data[npc_id] || null;
    
    // console.log(npcVersions.data);
    // console.log(version_tag);

    const key = `flapper:dialog:${user_id}:${slot_id}:${npc_id}`;
    const now = new Date().toISOString();
    const seoulTime = dayjs().tz('Asia/Seoul').format(); // ISO 8601 형식

    // 4. Redis 저장
    await redis.rPush(key, JSON.stringify({
      speaker: 'user',
      content: prompt,
      in_game_day,
      timestamp: seoulTime,
      version_tag,
      sequence
    }));

    await redis.rPush(key, JSON.stringify({
      speaker: 'npc',
      content: responseText,
      in_game_day,
      timestamp: dayjs().tz('Asia/Seoul').format(),
      version_tag,
      sequence
    }));

    return res.status(200).json({ response: responseText });
  } catch (err) {
    logger.error('❌ 대화 생성 실패:', err);
    next(createError(500, '❌ 대화 생성 실패', 'CHAT_FAILED'));
  }
};

// 대화 로그 수동 저장
const saveUserDialogLogs = async (req, res, next) => {
  const user_id = DEMO_MODE ? 1 : req.user?.user_id;
  const { slot_id, npc_id } = req.body;
  const redisKey = `flapper:dialog:${user_id}:${slot_id}:${npc_id}`;

  try {
    const rawLogs = await redis.lRange(redisKey, 0, -1);
    if (rawLogs.length === 0) return next(createError(404, '❌ 로그 없음', 'NO_LOG'));

    const parsedLogs = rawLogs.map(e => JSON.parse(e));
    const { in_game_day } = parsedLogs[0];

    const conn = await db.getConnection();
    await conn.beginTransaction();

    for (let i = 0; i < parsedLogs.length; i++) {
      const { speaker, content, timestamp, version_tag } = parsedLogs[i];
      const sequence = Math.floor(i / 2) + 1;
      const session_id = `${in_game_day}_${npc_id}_${slot_id}_${sequence}`;

      await conn.query(`
        INSERT INTO user_dialogs (
          session_id, user_id, slot_id, npc_id,
          speaker, message, created_at, is_training_data, version_tag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
      `, [
        session_id,
        user_id,
        slot_id,
        npc_id,
        speaker,
        content,
        timestamp,
        version_tag
      ]);
    }

    await conn.commit();
    conn.release();
    await redis.del(redisKey);

    res.status(201).json({ message: '✅ 대화 로그 저장 완료' });
  } catch (err) {
    next(createError(500, '❌ 저장 실패', 'SAVE_DIALOG_FAILED'));
  }
};

module.exports = {
  generateUserChat,
  saveUserDialogLogs
};
