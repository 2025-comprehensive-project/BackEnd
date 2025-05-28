// 관리자 인증 미들웨어
// 이 미들웨어는 JWT를 사용하여 관리자의 인증을 처리합니다.
// 관리자는 특정 API 엔드포인트에 접근할 수 있는 권한을 가진 사용자입니다.

const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>" 형식
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // 이후 라우터에서 req.admin 사용 가능
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = adminAuth;
