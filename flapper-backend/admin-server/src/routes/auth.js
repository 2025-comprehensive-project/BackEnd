const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// DB 연결 모듈 (예: MySQL2)
const db = require('../db');

router.post('/auth/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1. Google ID 토큰 검증
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const payload = response.data;

    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Invalid token audience' });
    }

    const { sub: googleId, email, name, picture: profileImage } = payload;

    // 2. 유저 정보 확인 또는 등록
    let [rows] = await db.execute('SELECT * FROM users WHERE google_id = ?', [googleId]);

    if (rows.length === 0) {
      await db.execute(
        'INSERT INTO users (google_id, email, name, profile_image_url) VALUES (?, ?, ?, ?)',
        [googleId, email, name, profileImage]
      );
    }

    // 3. JWT 발급
    const token = jwt.sign({ googleId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { name, email, profileImage } });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid Google token' });
  }
});

module.exports = router;
