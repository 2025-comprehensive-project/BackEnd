const express = require('express');
const path = require('path');
const router = express.Router();

// [GET] /api/public/download/apk
router.get('/apk', (req, res) => {
  const filePath = path.resolve(__dirname, '../../../../../apk/flapper-moonshine-v1.0.apk');
  res.download(filePath, 'flapper-moonshine.apk', (err) => {
    if (err) {
      console.error('❌ 파일 다운로드 실패:', err);
      res.status(500).send('파일 다운로드 실패');
    }
  });
});

module.exports = router;
