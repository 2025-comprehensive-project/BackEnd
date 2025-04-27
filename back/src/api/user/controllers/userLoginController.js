const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../../../config/dbConnect');
const createError = require('../../../utils/errorCreator');
const logger = require('../../../utils/logger');
const qs = require('qs');

exports.googleLogin = async (req, res, next) => {
  const { authCode } = req.body;

  if (!authCode) {
    return next(createError(400, 'Authorization Code가 필요합니다.', 'MISSING_AUTH_CODE'));
  }

  try {
    // 1. authCode를 이용해 access_token 발급
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code: authCode,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // // ✅ 토큰 전체 로그 출력 (scope 확인용)
    //console.log('✅ Token Response:', tokenResponse.data);

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error('Access Token이 존재하지 않습니다.');
    }

    // // 2. access_token으로 사용자 정보 조회
    // const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    //   headers: {
    //     Authorization: `Bearer ${access_token}`,
    //   },
    // });

    // 2. access_token으로 GPGS 사용자 정보 조회
    const userInfoRes = await axios.get('https://games.googleapis.com/games/v1/players/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    });

    // // GPGS player profile info
    // console.log('🎮 GPGS 유저 정보:', userInfoRes.data);

    // 데이터 추출
    const googleSub = userInfoRes.data.playerId; // GPGS 고유 ID
    const name = userInfoRes.data.displayName;   // GPGS 닉네임
    const picture = userInfoRes.data.avatarImageUrl; // GPGS 프로필 이미지
    const email = null; // GPGS에서는 이메일 제공 안함

    //const { sub: googleSub, email, name, picture } = userInfoRes.data;

    // 3. DB 유저 확인 또는 신규 생성
    const [rows] = await db.query(`SELECT * FROM user WHERE google_sub = ?`, [googleSub]);

    let user;
    if (rows.length === 0) {
      const [result] = await db.query(
        `INSERT INTO user (google_sub, email, name, profile_image)
         VALUES (?, ?, ?, ?)`,
        [googleSub, email, name, picture]
      );
      user = { user_id: result.insertId, name, profile_image: picture };
    } else {
      user = rows[0];
    }

    // 4. JWT 발급
    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    //console.log('✅ JWT 발급 완료:', token);

    res.json({
      message: '로그인 성공',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        profile_image: user.profile_image,
      },
    });

  } catch (err) {
    logger.error('❌ Google Token 요청 실패:', err.response?.data || err.message);
    //console.error('❌ Google Token 요청 실패:', err);
    return next(createError(401, 'Authorization Code 처리 실패: ' + (err.response?.data?.error_description || err.message), 'INVALID_AUTH_CODE'));
  }
};
