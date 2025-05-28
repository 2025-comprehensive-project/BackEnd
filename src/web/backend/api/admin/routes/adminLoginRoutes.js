const express = require('express');
const router = express.Router();
const {
    adminLogin,
    adminLogout,
    getAdminInfo,
    changePassword,
    sendPasswordResetLink,
    resetPassword,
    updateAdminInfo
} = require('../controllers/adminLoginController');

router.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱, !!!디버깅용!!!
const path = require('path'); // 경로 관련 모듈

const adminAuth = require('../../../middlewares/adminAuth'); // JWT 인증 미들웨어

// 로그인
// POST /api/admin/login
router.post('/login', adminLogin);

// 로그아웃
// POST /api/admin/logout
router.post('/logout', adminLogout);

// 비밀번호 변경 (JWT 인증 필요)
// PATCH /api/admin/password
router.patch('/password', adminAuth, changePassword);

// 관리자 이름/이메일 변경
// PATCH /api/admin/info
router.patch('/info', adminAuth, updateAdminInfo);

// 관리자 본인 정보 조회 (JWT 인증 필요)
// GET /api/admin/info
router.get('/info', adminAuth, getAdminInfo);

// 비밀번호 찾기 (메일 발송)
// POST /api/admin/forgot-password
router.post('/forgot-password', sendPasswordResetLink);

// ✅ 정적 HTML로 비밀번호 재설정 페이지 제공
// GET /api/admin/reset-password
router.get('/reset-password', (req, res) => {
    const token = req.query.token;
  
    if (!token) {
      return res.send(`
        <h3>❌ 유효하지 않은 접근입니다.</h3>
        <p>이 페이지는 이메일을 통해 발급된 링크로만 접근할 수 있습니다.</p>
      `);
    }
  
    // 📌 React 빌드 폴더 기준 경로
    res.sendFile(path.join(__dirname, '../../../../frontend/build/reset-password.html'));
  });

// 비밀번호 재설정 (POST 요청)
// POST /api/admin/reset-password
router.post('/reset-password', express.urlencoded({ extended: true }), resetPassword);

module.exports = router;
