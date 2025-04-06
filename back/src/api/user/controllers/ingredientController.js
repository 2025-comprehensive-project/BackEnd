const db = require('../../../config/dbConnect');

// ✅ 해금된 재료 조회
const getUnlockedIngredients = async (req, res) => {
  const user_id = req.user.user_id;
  const slot_id = parseInt(req.query.slot_id, 10);

  if (!slot_id) {
    return res.status(400).json({ message: 'slot_id is required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT i.ingredient_id, i.name
       FROM unlocked_ingredient ui
       JOIN ingredient i ON ui.ingredient_id = i.ingredient_id
       WHERE ui.user_id = ? AND ui.slot_id = ?`,
      [user_id, slot_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching unlocked ingredients:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ 재료 해금
const unlockIngredient = async (req, res) => {
  const user_id = req.user.user_id;
  const { slot_id, ingredient_id } = req.body;

  if (!slot_id || !ingredient_id) {
    return res.status(400).json({ message: 'slot_id and ingredient_id are required' });
  }

  try {
    await db.query(
      `INSERT IGNORE INTO unlocked_ingredient (user_id, slot_id, ingredient_id)
       VALUES (?, ?, ?)`,
      [user_id, slot_id, ingredient_id]
    );

    res.status(201).json({ message: '재료가 해금되었습니다.' });
  } catch (err) {
    console.error('❌ Error unlocking ingredient:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUnlockedIngredients,
  unlockIngredient
};
