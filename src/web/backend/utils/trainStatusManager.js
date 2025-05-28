// utils/trainStatusManager.js
const redisClient = require('../config/redisClient');

const getKey = (version) => `flapper:trainStatus:${version}`;

exports.setTrainStatus = async (version, statusObj) => {
  await redisClient.set(getKey(version), JSON.stringify(statusObj));
};

exports.updateTrainStatus = async (version, updateObj) => {
  const existing = await redisClient.get(getKey(version));
  const data = existing ? JSON.parse(existing) : {};
  const updated = { ...data, ...updateObj };
  await redisClient.set(getKey(version), JSON.stringify(updated));
};

exports.getTrainStatus = async (version) => {
  const data = await redisClient.get(getKey(version));
  return data ? JSON.parse(data) : null;
};

// ✅ 추가: 현재 "running" 상태인 모든 학습 세션 반환
exports.getAllActiveTrainings = async () => {
  const keys = await redisClient.keys('flapper:trainStatus:*');
  const results = [];

  for (const key of keys) {
    const data = await redisClient.get(key);
    if (!data) continue;

    const status = JSON.parse(data);
    if (status.status === 'running') {
      results.push(status);
    }
  }

  return results;
};
