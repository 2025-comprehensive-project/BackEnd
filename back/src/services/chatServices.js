const db = require('../utils/dbConnect');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // 1. 대화 세션 시작 시 새 session_id 발급
  createSession: async (user_id, npc_id, base_model_version = null) => {
    const session_id = uuidv4();

    await db.maria.execute(
      `INSERT INTO training_sessions (session_id, user_id, npc_id, base_model_version, status)
       VALUES (?, ?, ?, ?, 'queued')`,
      [session_id, user_id, npc_id, base_model_version]
    );

    return session_id;
  },

  // 2. 유저 메시지 저장
  logUserMessage: async (session_id, user_id, npc_id, message) => {
    await db.maria.execute(
      `INSERT INTO user_dialog_logs (session_id, user_id, npc_id, speaker, message)
       VALUES (?, ?, ?, 'user', ?)`,
      [session_id, user_id, npc_id, message]
    );
  },

  // 3. NPC 응답 저장
  logNpcReply: async (session_id, user_id, npc_id, reply, version_tag, emotion_tag = null) => {
    await db.maria.execute(
      `INSERT INTO user_dialog_logs (session_id, user_id, npc_id, speaker, message, emotion_tag, version_tag)
       VALUES (?, ?, ?, 'npc', ?, ?, ?)`,
      [session_id, user_id, npc_id, reply, emotion_tag, version_tag]
    );
  },
};
