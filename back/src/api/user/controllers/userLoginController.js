const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');
const logger = require('../../../utils/logger'); // 로거 유틸리티

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res, next) => {
  const { idToken } = req.body;

  try {
    // ID 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleSub = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // DB에서 유저 확인 또는 생성
    const [rows] = await db.query(
      `SELECT * FROM user WHERE google_sub = ?`,
      [googleSub]
    );

    let user;
    if (rows.length === 0) {
      const [result] = await db.query(
        `INSERT INTO user (google_sub, email, name, profile_image)
         VALUES (?, ?, ?, ?)`,
        [googleSub, email, name, picture]
      );

      user = {
        user_id: result.insertId,
        name,
        profile_image: picture
      };
    } else {
      user = rows[0];
    }

    // JWT 발급
    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        profile_image: user.profile_image,
      }
    });
  } catch (err) {
    logger.error('❌ ID 토큰 검증 또는 로그인 처리 실패:', err);
    next(createError(401, 'ID 토큰 검증 실패', 'INVALID_ID_TOKEN'));
  }
};
