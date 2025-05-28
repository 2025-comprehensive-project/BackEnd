const db = require('../../../config/dbConnect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const redis = require('../../../config/redisClient');
const createError = require('../../../utils/errorCreator');
const { logger } = require('../../../utils/logger');

// Nodemailer 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 관리자 로그인
const adminLogin = async (req, res, next) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail.toLowerCase();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            logger.warn(`⚠️ 로그인 실패 - 존재하지 않는 이메일: ${email} / IP: ${ip}`);
            return next(createError(401, '❌ 이메일 혹은 비밀번호가 틀립니다.'));
        }

        const admin = rows[0];
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            logger.warn(`⚠️ 로그인 실패 - 비밀번호 불일치: ${email} / IP: ${ip}`);
            return next(createError(401, '❌ 이메일 혹은 비밀번호가 틀립니다.'));
        }

        const token = jwt.sign(
            { admin_id: admin.admin_id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        logger.info(`🛡️ 관리자 로그인 성공 - Email: ${email} / IP: ${ip}`);
        res.json({ token, message: '✅ 로그인 성공' });

    } catch (error) {
        logger.error(`❌ 서버 오류 - 이메일: ${email} / IP: ${ip} / 이유: ${error?.message || error}`);
        return next(createError(500, '❌ 서버 오류', 'LOGIN_ERROR'));
    }
};

// 로그아웃
const adminLogout = async (req, res) => {
    return res.status(200).json({ message: '✅ 로그아웃 되었습니다.' });
};

// 관리자 정보 조회 (이름 포함하도록 수정)
const getAdminInfo = async (req, res, next) => {
    const adminId = req.admin?.admin_id;
    if (!adminId) {
        return next(createError(401, '❌ Unauthorized'));
    }

    try {
        const [rows] = await db.query('SELECT admin_id, email, admin_name FROM admin WHERE admin_id = ?', [adminId]);
        if (rows.length === 0) {
            return next(createError(404, '❌ 해당하는 관리자가 존재하지 않습니다.'));
        }

        return res.status(200).json({ admin: rows[0] });
    } catch (error) {
        return next(createError(500, '❌ 서버 오류', 'ADMIN_INFO_ERROR'));
    }
};

// 관리자 정보 업데이트 (이름, 이메일)
const updateAdminInfo = async (req, res, next) => {
    const adminId = req.admin?.admin_id;
    const { admin_name, email } = req.body;

    if (!adminId) return next(createError(401, '❌ Unauthorized'));
    if (!admin_name && !email) {
        return next(createError(400, '❌ 변경할 항목이 없습니다.'));
    }

    try {
        // 이메일 중복 검사
        if (email) {
            const [rows] = await db.query(
                'SELECT admin_id FROM admin WHERE email = ? AND admin_id != ?',
                [email.toLowerCase(), adminId]
            );
            if (rows.length > 0) {
                return next(createError(409, '❌ 이미 사용 중인 이메일입니다.'));
            }
        }

        // 업데이트 SQL 동적 구성
        const fields = [];
        const values = [];

        if (admin_name) {
            fields.push('admin_name = ?');
            values.push(admin_name);
        }
        if (email) {
            fields.push('email = ?');
            values.push(email.toLowerCase());
        }

        values.push(adminId);

        const sql = `UPDATE admin SET ${fields.join(', ')} WHERE admin_id = ?`;
        await db.query(sql, values);

        return res.status(200).json({ message: '✅ 관리자 정보가 업데이트되었습니다.' });
    } catch (error) {
        return next(createError(500, '❌ 서버 오류', 'UPDATE_ADMIN_INFO_ERROR'));
    }
};

// 비밀번호 변경
const changePassword = async (req, res, next) => {
    const adminId = req.admin?.admin_id;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!adminId) return next(createError(401, '❌ Unauthorized'));
    if (newPassword !== newPasswordConfirm) {
        return next(createError(400, '❌ 비밀번호가 일치하지 않습니다.'));
    }

    try {
        const [rows] = await db.query('SELECT password FROM admin WHERE admin_id = ?', [adminId]);
        if (rows.length === 0) {
            return next(createError(404, '❌ 해당하는 관리자가 존재하지 않습니다.'));
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return next(createError(403, '❌ 현재 비밀번호가 올바르지 않습니다.'));
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE admin SET password = ? WHERE admin_id = ?', [hashedNewPassword, adminId]);

        return res.status(200).json({ message: '✅ 비밀번호가 갱신되었습니다.' });
    } catch (error) {
        return next(createError(500, '❌ 서버 오류', 'CHANGE_PASSWORD_ERROR'));
    }
};

// 비밀번호 재설정 메일 전송
const sendPasswordResetLink = async (req, res, next) => {
    const { email: rawEmail } = req.body;
    const email = rawEmail.toLowerCase();
    const cooldownKey = `flapper:reset:cooldown:${email}`;
    const tokenKey = `flapper:reset:token:${email}`;

    try {
        const cooldown = await redis.get(cooldownKey);
        if (cooldown) {
            return next(createError(429, '❌ 이미 요청한 이메일입니다. 잠시 후 다시 시도해주세요.'));
        }

        const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return next(createError(404, '❌ 존재하지 않는 이메일입니다.'));
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        await redis.setEx(cooldownKey, 600, '1');
        await redis.setEx(tokenKey, 900, token);

        const resetUrl = `${process.env.BASE_RESET_URL}?token=${token}`;

        await transporter.sendMail({
            to: email,
            subject: 'Flapper Moonshine 관리자 계정 비밀번호 재설정 링크',
            html: `<p>아래 링크를 클릭하여 비밀번호를 재설정하세요:<br><a href="${resetUrl}">${resetUrl}</a></p>`
        });

        return res.status(200).json({ message: '✅ 비밀번호 재설정 링크를 이메일로 보냈습니다.' });
    } catch (error) {
        logger.error(`[메일 전송 오류] ${error.message || error}`);
        return next(createError(500, '❌ 메일 전송 오류', 'RESET_EMAIL_ERROR'));
    }
};

// 비밀번호 재설정
const resetPassword = async (req, res, next) => {
    const { token, newPassword, newPasswordConfirm } = req.body;

    if (!token) return next(createError(400, '❌ 토큰이 없습니다.'));
    if (newPassword !== newPasswordConfirm) {
        return next(createError(400, '❌ 비밀번호가 일치하지 않습니다.'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email.toLowerCase();
        const tokenKey = `flapper:reset:token:${email}`;

        const storedToken = await redis.get(tokenKey);
        if (!storedToken || storedToken !== token) {
            return next(createError(400, '❌ 이 토큰은 만료되었거나 무효합니다.'));
        }

        const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return next(createError(404, '❌ 존재하지 않는 계정입니다.'));
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE admin SET password = ? WHERE email = ?', [hashedPassword, email]);
        await redis.del(tokenKey);
        await redis.del(`flapper:reset:cooldown:${email}`);

        return res.send('<h3>✅ 비밀번호가 성공적으로 변경되었습니다.</h3>');
    } catch (err) {
        return next(createError(400, '❌ 유효하지 않은 토큰입니다.', 'INVALID_TOKEN'));
    }
};

module.exports = {
    adminLogin,
    adminLogout,
    getAdminInfo,
    updateAdminInfo, 
    changePassword,
    sendPasswordResetLink,
    resetPassword
};
