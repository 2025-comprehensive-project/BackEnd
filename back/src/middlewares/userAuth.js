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
