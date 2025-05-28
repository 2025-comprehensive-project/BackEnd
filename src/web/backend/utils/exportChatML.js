const fs = require('fs');
const path = require('path');
const db = require('../config/dbConnect');
const { logger } = require('./logger');

async function exportChatML(user_id, slot_id, npc_id, outPath) {
  try {
    // 1. DB 조회
    const [rows] = await db.query(`
      SELECT speaker, message, created_at
      FROM user_dialogs
      WHERE user_id = ? AND slot_id = ? AND npc_id = ?
        AND is_training_data = 1
      ORDER BY created_at ASC
    `, [user_id, slot_id, npc_id]);

    if (rows.length < 2) {
      logger.warn(`[RoLA] ${npc_id}: 대화 로그 수 부족`);
      return { lastTimestamp: null };
    }

    // 2. user ↔ assistant 쌍으로 묶기
    const examples = [];
    for (let i = 0; i < rows.length - 1; i++) {
      const cur = rows[i];
      const next = rows[i + 1];
      if (cur.speaker === 'user' && next.speaker === 'npc') {
        examples.push({
          messages: [
            { role: 'user', content: cur.message },
            { role: 'npc', content: next.message }
          ]
        });
      }
    }

    if (examples.length === 0) {
      logger.warn(`[RoLA] ${npc_id}: 학습용 대화쌍 없음`);
      return { lastTimestamp: null };
    }

    // 3. 디렉토리 생성
    const dir = path.dirname(outPath);
    fs.mkdirSync(dir, { recursive: true });

    // 4. JSONL 저장
    const stream = fs.createWriteStream(outPath, { flags: 'w' });
    examples.forEach(e => stream.write(JSON.stringify(e) + '\n'));
    stream.end();

    logger.info(`[RoLA] ${npc_id}: ${examples.length}개 대화쌍 저장 → ${outPath}`);

    // 5. 마지막 타임스탬프 리턴 (created_at: 학습 범위 기준)
    const lastTimestamp = rows[rows.length - 1].created_at;
    return { lastTimestamp };
  } catch (err) {
    logger.error(`[RoLA][${npc_id}] exportChatML 실패:`, err);
    return { lastTimestamp: null };
  }
}

module.exports = { exportChatML };
