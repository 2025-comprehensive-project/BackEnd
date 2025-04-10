const db = require('../../../config/dbConnect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const client = require('../../../config/redisClient');

// 이 계정으로 초기화 메일을 보냄
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,   // 보내는 사람
        pass: process.env.EMAIL_PASS    // 해당 계정의 인증 정보
    }
});


// 관리자 로그인
// 로그인 시 이메일과 비밀번호를 확인하고 JWT 토큰을 발급
const adminLogin = async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail.toLowerCase(); // 이메일 소문자 변환
    try {
        // 입력한 이메일이 DB에 존재하는지 확인
        const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: '❌ 이메일 혹은 비밀번호가 틀립니다.' });
        }

        const admin = rows[0];

        // 비밀번호 검증
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: '❌ 이메일 혹은 비밀번호가 틀립니다.' });
        }

        // JWT 토큰 발급
        const token = jwt.sign(
            { admin_id: admin.admin_id, email: admin.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '4h' } // 토큰 만료 시간 설정
        );

        res.json({ token, message: '✅ 로그인 성공' });
    } catch (error) {
        console.error('[Login Error]', error);
        return res.status(500).json({ message: '❌ 서버 오류가 발생했습니다.' });
    }
};

// 관리자 로그아웃
// 로그아웃은 클라이언트 측에서 토큰을 삭제하는 것으로 처리
const adminLogout = async (req, res) => {
    // 프론트에서 토큰을 제거하도록 안내
    console.log('Logout successful, please remove the token from client.');
    return res.status(200).json({ message: '✅ 로그아웃 되었습니다.' });
};

// 관리자 정보 조회
// 관리자 정보는 JWT 토큰에서 추출하여 사용
const getAdminInfo = async (req, res) => {
    const adminId = req.admin?.admin_id; // 미들웨어에서 주입된 값
    if (!adminId) {
        return res.status(401).json({ message: '❌ Unauthorized' });
    }

    try {
        const [rows] = await db.query('SELECT admin_id, email FROM admin WHERE admin_id = ?', [adminId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: '❌ 해당하는 관리자가 존재하지 않습니다.' });
        }

        return res.status(200).json({ admin: rows[0] });
    } catch (error) {
        console.error('Get admin info error:', error);
        return res.status(500).json({ message: '❌ 서버 오류' });
    }
};

// 비밀번호 변경
// 현재 비밀번호와 새 비밀번호를 입력받아 비밀번호를 변경
const changePassword = async (req, res) => {
    const adminId = req.admin?.admin_id;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!adminId) {
        return res.status(401).json({ message: '❌ Unauthorized' });
    }

    if (newPassword !== newPasswordConfirm) {
        return res.status(400).json({ message: '❌ 비밀번호가 일치하지 않습니다.' });
    }

    try {
        const [rows] = await db.query('SELECT password FROM admin WHERE admin_id = ?', [adminId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: '❌ 해당하는 관리자가 존재하지 않습니다.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return res.status(403).json({ message: '❌ 현재 비밀번호가 올바르지 않습니다.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE admin SET password = ? WHERE admin_id = ?', [hashedNewPassword, adminId]);

        return res.status(200).json({ message: '✅ 비밀번호가 갱신되었습니다.' });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ message: '❌ 서버 오류' });
    }
};

// 비밀번호 재설정 링크 전송
// 이메일로 비밀번호 재설정 링크를 전송
const sendPasswordResetLink = async (req, res) => {
    const { email: rawEmail } = req.body;
    const email = rawEmail.toLowerCase(); // 이메일 소문자 변환
    const cooldownKey = `flapper:reset:cooldown:${email}`;
    const tokenKey = `flapper:reset:token:${email}`;

    try {
        // 1. 쿨타임 확인
        const cooldown = await client.get(cooldownKey);
        if (cooldown) {
            return res.status(429).json({ message: '❌ 이미 요청한 이메일입니다. 잠시 후 다시 시도해주세요.' });
        }

        // 2. 이메일 존재 확인
        const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: '❌ 존재하지 않는 이메일입니다.' });
        }

        // 3. 토큰 생성 및 저장
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        await client.setEx(cooldownKey, 600, '1'); // 쿨타임 10분
        await client.setEx(tokenKey, 900, token);  // 토큰 유효 15분

        const resetUrl = `${process.env.BASE_RESET_URL}?token=${token}`;

        await transporter.sendMail({
            to: email,
            subject: 'Flapper Moonshine 관리자 계정 비밀번호 재설정 링크',
            html: `<p>아래 링크를 클릭하여 비밀번호를 재설정하세요:<br><a href="${resetUrl}">${resetUrl}</a></p>`
        });

        return res.status(200).json({ message: '✅ 비밀번호 재설정 링크를 이메일로 보냈습니다.' });
    } catch (error) {
        console.error('❌ 메일 전송 오류:', error);
        return res.status(500).json({ message: '❌ 서버 오류' });
    }
};

// 비밀번호 재설정
// 재설정 링크에서 받은 토큰을 검증하고 새 비밀번호로 업데이트
const resetPassword = async (req, res) => {
    const { token, newPassword, newPasswordConfirm } = req.body;

    if (!token) return res.status(400).send('❌ 토큰이 없습니다.');
    if (newPassword !== newPasswordConfirm) {
        return res.status(400).send('❌ 비밀번호가 일치하지 않습니다.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email.toLowerCase();
        const tokenKey = `flapper:reset:token:${email}`;

        const storedToken = await client.get(tokenKey);
        if (!storedToken || storedToken !== token) {
            return res.status(400).send('❌ 이 토큰은 만료되었거나 무효합니다.');
        }

        const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).send('❌ 존재하지 않는 계정입니다.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE admin SET password = ? WHERE email = ?', [hashedPassword, email]);
        await client.del(tokenKey); // 토큰 삭제
        await client.del(`flapper:reset:cooldown:${email}`); // Redis 내 해당 계정 쿨타임 삭제 
        return res.send('<h3>✅ 비밀번호가 성공적으로 변경되었습니다.</h3>');
    } catch (err) {
        console.error('Reset error:', err);
        return res.status(400).send('❌ 유효하지 않은 토큰입니다.');
    }
};

module.exports = { adminLogin, adminLogout, getAdminInfo, changePassword, sendPasswordResetLink, resetPassword };
// src/web/backend/api/admin/controllers/loginController.js
