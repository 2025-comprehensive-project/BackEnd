// src/config/redisClient.js
const redis = require('redis');

const client = redis.createClient();

client.on('error', (err) => console.error('❌ Redis Connection failed:', err));
client.on('connect', () => console.log('🟢 Redis Successfully connected.'));

client.connect();

module.exports = client;
