// src/controllers/admin/userController.js
const db = require('../../../../src/config/dbConnect');

// 🔹 유저 정보 조회 (GET /api/admin/users/:user_id)
const getUserInfo = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM user WHERE user_id = ?', [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 유저 생성 (POST /api/admin/users)
const createUser = async (req, res) => {
  const {
    google_sub,
    email,
    name,
    profile_image,
    play_time = 0,
    current_chapter = 1,
    money = 0,
    reputation_score = 0,
    signature_cocktail_id = null
  } = req.body;

  if (!google_sub) {
    return res.status(400).json({ message: 'google_sub is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO user 
        (google_sub, email, name, profile_image, play_time, current_chapter, money, reputation_score, signature_cocktail_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        google_sub,
        email || null,
        name || null,
        profile_image || null,
        play_time,
        current_chapter,
        money,
        reputation_score,
        signature_cocktail_id
      ]
    );

    res.status(201).json({ message: 'User created', user_id: result.insertId });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserInfo, createUser };
