// dotenv를 불러와서 환경 변수를 로드
require('dotenv').config();

const mysql = require('mysql2');

// 환경 변수에서 DB 정보를 가져옴
const connection = mysql.createConnection({
    host: process.env.DB_HOST,      // MariaDB 서버 주소
    user: process.env.DB_USER,      // MariaDB 사용자 이름
    password: process.env.DB_PASSWORD,   // MariaDB 비밀번호
    database: process.env.DB_NAME   // 사용할 데이터베이스 이름
});

connection.connect(err => {
    if (err) {
        console.error('❌ DB 연결 실패:', err);
        return;
    }
    console.log('✅ DB 연결 성공!');
});

module.exports = connection;
