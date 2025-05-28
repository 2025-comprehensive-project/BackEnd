// Description: 어드민 계정 생성 또는 비밀번호 수정 스크립트
require('dotenv').config();
const db = require('../config/dbConnect');
const bcrypt = require('bcrypt');
const readline = require('readline');

console.log(process.env.DB_USER);

// 터미널 입력을 위한 인터페이스 설정
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 이메일 입력 프롬프트
rl.question('Enter admin email: ', (emailInput) => {
    if (!emailInput) {
        console.log('❌ Email cannot be empty.');
        rl.close();
        process.exit(1);
    }

    const email = emailInput.toLowerCase(); // 이메일 소문자 변환

    // DB 조회 및 분기 처리
    db.query('SELECT * FROM admin WHERE email = ?', [email])
        .then(async ([existingAdmin]) => {
            if (existingAdmin.length > 0) {
                // 이미 존재 → 비밀번호 수정 여부 확인
                rl.question('⚠️ Admin exists. Do you want to update the password? (y/N): ', async (confirm) => {
                    if (confirm.toLowerCase() === 'y') {
                        rl.question('Enter new password: ', async (newPassword) => {
                            if (!newPassword) {
                                console.log('❌ Password cannot be empty.');
                                rl.close();
                                process.exit(1);
                            }
                            const hashed = await bcrypt.hash(newPassword, 10);
                            await db.query('UPDATE admin SET password = ? WHERE email = ?', [hashed, email]);
                            console.log(`🔄 Password for ${email} updated successfully.`);
                            rl.close();
                            process.exit();
                        });
                    } else {
                        console.log('❌ Aborted.');
                        rl.close();
                        process.exit();
                    }
                });
            } else {
                // 신규 생성
                rl.question('Enter admin password: ', async (password) => {
                    if (!password) {
                        console.log('❌ Password cannot be empty.');
                        rl.close();
                        process.exit(1);
                    }
                    const hashedPassword = await bcrypt.hash(password, 10);
                    await db.query('INSERT INTO admin (email, password) VALUES (?, ?)', [email, hashedPassword]);
                    console.log(`✅ Admin account for ${email} created successfully!`);
                    rl.close();
                    process.exit();
                });
            }
        })
        .catch((error) => {
            console.error('❌ Error querying admin table:', error);
            rl.close();
            process.exit(1);
        });
    })