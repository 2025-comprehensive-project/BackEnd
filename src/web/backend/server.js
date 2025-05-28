const { app } = require('./app');
const dotenv = require('dotenv');
const { startFlaskServer, stopFlaskServer } = require('./services/flaskManager'); // ✅ flaskManager 사용
const logger = require('./utils/logger');

dotenv.config();

const PORT = process.env.PORT || 60003;
const DEMO_MODE = process.env.DEMO_MODE === 'True'; // ✅ 추가

app.listen(PORT, async () => {
  const now = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour12: false
  });

  console.log(`🚀 Node.js 서버 실행됨: http://localhost:${PORT} (Seoul: ${now})`);
  console.log(`🛡️  DEMO_MODE=${DEMO_MODE ? 'ON' : 'OFF'}`);

  if (DEMO_MODE) {
    console.log('⚠️  DEMO_MODE가 활성화되어 Flask 서버는 실행되지 않습니다.');
  } else {
    try {
      await startFlaskServer(); // ✅ flaskManager 통해 실행
      console.log('✅ Flask 서버 자동 시작 완료');
    } catch (err) {
      console.error('❌ Flask 서버 자동 시작 실패:', err.message);
    }
  }
});

// Node.js 종료될 때 Flask 프로세스도 종료
process.on('SIGINT', async () => {
  if (!DEMO_MODE) {
    try {
      await stopFlaskServer(); // ✅ flaskManager 통해 종료
      console.log('🛑 Flask 서버 자동 종료 완료');
    } catch (err) {
      console.error('❌ Flask 서버 종료 실패:', err.message);
    }
  } else {
    console.log('⚠️  DEMO_MODE: Flask 종료 스킵됨');
  }
  process.exit();
});

