// src/config/redisClient.js
// Redis 클라이언트 설정
// Redis 클라이언트를 설정하는 파일입니다. Redis 서버에 연결합니다.

const redis = require('redis');

const client = redis.createClient();

client.on('error', (err) => console.error('❌ Redis Connection failed:', err));
client.on('connect', () => console.log('🟢 Redis Successfully connected.'));

client.connect();

module.exports = client;
