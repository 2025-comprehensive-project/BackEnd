// src/controllers/auth/googleAuthController.js
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/dbConnect');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { id_token } = req.body;

  try {
    // 1️⃣ 구글 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: google_sub,
      email,
      name,
      picture: profile_image,
    } = payload;

    // 2️⃣ DB에 유저 존재 확인
    const [rows] = await db.query('SELECT * FROM user WHERE google_sub = ?', [google_sub]);

    let user;
    if (rows.length === 0) {
      // 3️⃣ 유저가 없으면 신규 가입
      const [result] = await db.query(
        `INSERT INTO user (google_sub, email, name, profile_image)
         VALUES (?, ?, ?, ?)`,
        [google_sub, email, name, profile_image]
      );
      user = { user_id: result.insertId, google_sub, email, name };
    } else {
      user = rows[0];
    }

    // 4️⃣ 자체 JWT 발급
    const token = jwt.sign(
      { user_id: user.user_id, google_sub: user.google_sub },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

module.exports = { googleLogin };
