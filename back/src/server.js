// src/server.js

const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 60003;

app.listen(PORT, () => {
  const now = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour12: false
  });
  console.log(`🚀 Server is running on http://localhost:${PORT} (Seoul: ${now})`);
});
