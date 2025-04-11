const express = require('express');
const router = express.Router();
const {
    adminLogin,
    adminLogout,
    getAdminInfo,
    changePassword,
    sendPasswordResetLink,
    resetPassword
} = require('../controllers/loginController');

router.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱, !!!디버깅용!!!

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

// 관리자 본인 정보 조회 (JWT 인증 필요)
// GET /api/admin/info
router.get('/info', adminAuth, getAdminInfo);

// 비밀번호 찾기 (메일 발송)
// POST /api/admin/forgot-password
router.post('/forgot-password', sendPasswordResetLink);

// 비밀번호 재설정 (메일 링크 클릭 후, 현재 프론트 페이지가 없어 디버깅용으로 GET 요청을 사용함)
// router.post('/reset-password', resetPassword);
router.get('/reset-password', (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.send(`
            <h3>❌ 유효하지 않은 접근입니다.</h3>
            <p>이 페이지는 이메일을 통해 발급된 링크로만 접근할 수 있습니다.</p>
        `);
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>비밀번호 재설정</title>
            <style>
                body {
                    font-family: sans-serif;
                    max-width: 500px;
                    margin: 50px auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                input {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <h2>🔐 비밀번호 재설정</h2>
            <form method="POST" action="/api/admin/reset-password">
                <input type="hidden" name="token" value="${token}" />
                <label for="newPassword">새 비밀번호:</label>
                <input type="password" id="newPassword" name="newPassword" required />

                <label for="newPasswordConfirm">비밀번호 확인:</label>
                <input type="password" id="newPasswordConfirm" name="newPasswordConfirm" required />

                <button type="submit">비밀번호 변경</button>
            </form>
        </body>
        </html>
    `);
});

// 비밀번호 재설정 (POST 요청)
// POST /api/admin/reset-password
router.post('/reset-password', express.urlencoded({ extended: true }), resetPassword);

module.exports = router;
