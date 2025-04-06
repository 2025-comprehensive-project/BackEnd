const db = require('../../../config/dbConnect');

const loadSaveData = async (req, res) => {
  const { user_id, load_id } = req.body;

  if (!user_id || !load_id) {
    return res.status(400).json({ message: 'user_id and load_id are required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT money, in_game_day AS date, play_time, chapter, reputation_score
       FROM user_save
       WHERE user_id = ? AND slot_id = ?`,
      [user_id, load_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '해당 세이브 데이터를 찾을 수 없습니다.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error loading save data:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};

module.exports = {
  loadSaveData
};
