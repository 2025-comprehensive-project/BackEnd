const express = require('express');
const path = require('path');
const router = express.Router();

// [GET] /api/public/download/apk
router.get('/apk', (req, res) => {
  const filePath = path.resolve(__dirname, '../../../../../apk/FlapperAndMoonshine.apk');
  res.download(filePath, 'FlapperMoonshine.apk', (err) => {
    if (err) {
      if (err.code === 'EPIPE') {
        // 연결 중단된 경우는 조용히 무시
        return;
      }
      console.error('❌ 파일 다운로드 실패:', err);
      if (!res.headersSent) {
        res.status(500).send('파일 다운로드 실패');
      }
    }
  });

  res.on('close', () => {
    console.warn('⚠️ 다운로드가 중단되었습니다.');
  });
});

module.exports = router;
