const db = require('../config/dbConnect');

// 🔹 유저 정보 조회
const getUserInfo = async (req, res) => {
    const { user_id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔹 유저 생성 (회원가입 개념 X, 관리자 추가 가능)
const createUser = async (req, res) => {
    const { email } = req.body;
    try {
        const [result] = await db.query('INSERT INTO user (email) VALUES (?)', [email]);
        res.status(201).json({ user_id: result.insertId, message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUserInfo, createUser };
