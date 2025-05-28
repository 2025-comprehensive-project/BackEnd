const axios = require('axios');
const { logger } = require('../utils/logger');
const createError = require('../utils/errorCreator');

const FLASK_URL = process.env.FLASK_BASE_URL || 'http://localhost:50003';

exports.generateFromFlask = async (prompt, npc_id = 'base', options = {}) => {
  try {
    const { user_id = null, slot_id = null } = options;

    const payload = { prompt };
    if (user_id !== null) payload.user_id = user_id;
    if (slot_id !== null) payload.slot_id = slot_id;

    const response = await axios.post(`${FLASK_URL}/generate/${npc_id}`, payload);

    if (response.status !== 200) {
      logger.error(`❌ Flask 서버 응답 오류. 상태 코드: ${response.status}`);
      throw createError(500, '❌ Flask 서버 응답 오류', 'FLASK_RESPONSE_ERROR');
    }

    if (!response.data || !response.data.response) {
      logger.error('❌ Flask 서버 응답 형식 오류');
      throw createError(500, '❌ Flask 서버 응답 형식 오류', 'FLASK_RESPONSE_FORMAT_ERROR');
    }

    return response.data.response;

  } catch (error) {
    logger.error('❌ Flask 서버와의 통신 오류:', error.message || error);
    throw createError(500, '❌ Flask 서버와의 통신 실패', 'FLASK_COMMUNICATION_ERROR');
  }
};
