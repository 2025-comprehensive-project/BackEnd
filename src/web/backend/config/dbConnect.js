// src/config/dbConnect.js
// DB 연결 설정
// DB 연결을 위한 설정 파일입니다. 환경변수에서 DB 정보를 가져옵니다.

require('dotenv').config();
const mysql = require('mysql2/promise');

// ✅ 비동기 DB 풀 생성
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
