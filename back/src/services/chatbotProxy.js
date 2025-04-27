// File: src/web/backend/services/chatbotProxy.js
// 챗봇 프록시 서비스, Flask 서버와의 통신을 담당합니다.
// 이 서비스는 Flask 서버에 요청을 보내고, 응답을 받아서 클라이언트에 전달합니다.

const axios = require('axios');

const FLASK_URL = 'http://localhost:50003';

exports.generateFromFlask = async (prompt) => {
  const response = await axios.post(`${FLASK_URL}/generate`, { prompt });
  return response.data.response;
};
