require('dotenv').config();
const db = require('../config/dbConnect');
const bcrypt = require('bcrypt');
const readline = require('readline');

console.log(process.env.DB_USER);

// 🔹 터미널 입력을 위한 인터페이스 설정
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 🔹 이메일 입력 프롬프트
rl.question('Enter admin email: ', (email) => {
    if (!email) {
        console.log('❌ Email cannot be empty.');
        rl.close();
        process.exit(1);
    }

    // 🔹 비밀번호 입력 프롬프트 (비밀번호 숨김 처리 X)
    rl.question('Enter admin password: ', async (password) => {
        if (!password) {
            console.log('❌ Password cannot be empty.');
            rl.close();
            process.exit(1);
        }

        try {
            // 1️⃣ 기존 관리자 계정 존재 여부 확인
            const [existingAdmin] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
            if (existingAdmin.length > 0) {
                console.log('⚠️ Admin account already exists.');
                rl.close();
                process.exit();
            }

            // 2️⃣ 비밀번호 해싱
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3️⃣ 어드민 계정 삽입
            await db.query('INSERT INTO admin (email, password) VALUES (?, ?)', [email, hashedPassword]);

            console.log(`✅ Admin account for ${email} created successfully!`);
        } catch (error) {
            console.error('❌ Error inserting admin:', error);
        } finally {
            rl.close();
            process.exit();
        }
    });
});
