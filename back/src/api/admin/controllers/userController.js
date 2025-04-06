// src/controllers/admin/userController.js
const db = require('../../../../src/config/dbConnect');

// 1. 전체 유저 목록 조회 (GET /api/admin/users)
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM user');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. 특정 유저 슬롯 정보 조회 (GET /api/admin/users/:user_id/saves/:slot_id)
const getUserInfo = async (req, res) => {
  const { user_id, slot_id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM saves WHERE user_id = ? AND slot_id = ?',
      [user_id, slot_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Save data not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching user save info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. 특정 유저 대화 로그 조회 (GET /api/admin/users/:user_id/dialog-logs?slot_id=...)
const getUserDialogLogs = async (req, res) => {
  const { user_id } = req.params;
  const { slot_id } = req.query;

  if (!slot_id) {
    return res.status(400).json({ message: 'slot_id is required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM dialog_logs WHERE user_id = ? AND slot_id = ?',
      [user_id, slot_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching dialog logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. 유저 정보 수정 (PUT /api/admin/users/:user_id/saves/:slot_id)
const updateUserInfo = async (req, res) => {
  const { user_id, slot_id } = req.params;
  const { reputation, currency } = req.body;

  if (reputation == null || currency == null) {
    return res.status(400).json({ message: 'reputation and currency are required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE saves SET reputation = ?, currency = ? WHERE user_id = ? AND slot_id = ?',
      [reputation, currency, user_id, slot_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No matching save data to update' });
    }

    res.json({ message: 'User save info updated successfully' });
  } catch (error) {
    console.error('❌ Error updating user save info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserInfo,
  getUserDialogLogs,
  updateUserInfo
};
