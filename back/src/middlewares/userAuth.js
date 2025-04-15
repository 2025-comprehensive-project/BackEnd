// JWT 인증 미들웨어
// 유저 인증을 위한 미들웨어, 사용자가 요청을 보낼 때 JWT를 통해 인증을 수행합니다.
// JWT를 사용하여 사용자의 신원을 확인하고, 인증된 사용자만 요청을 처리할 수 있도록 합니다.

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증 정보 없음' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // ✅ 이후 라우터에서 req.user.userId 로 접근 가능
    next();
  } catch (err) {
    console.error('JWT 인증 실패:', err);
    res.status(401).json({ message: '인증 실패' });
  }
};
