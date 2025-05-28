// src/routes/public/index.js
const express = require('express');
const router = express.Router();

const metaRoutes = require('./routes/metaRoutes');
const downloadRoutes = require('./routes/downloadRoutes'); // ⬅️ 추가

router.use('/meta', metaRoutes); // 기본 칵테일, 재료 및 가니시 관련 퍼블릭 라우트
router.use('/download', downloadRoutes); // ⬅️ 추가

module.exports = router;
// src/routes/public/metaRoutes.js