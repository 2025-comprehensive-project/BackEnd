const db = require('../../config/dbConnect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔹 관리자 로그인
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 입력한 이메일이 DB에 존재하는지 확인
        const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const admin = rows[0];

        // 비밀번호 검증
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // JWT 토큰 발급
        const token = jwt.sign(
            { admin_id: admin.admin_id, email: admin.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' } // 토큰 만료 시간 설정
        );

        res.json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { adminLogin };
