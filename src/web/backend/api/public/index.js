// src/routes/public/index.js
const express = require('express');
const router = express.Router();

const metaRoutes = require('./metaRoutes');

router.use('/meta', metaRoutes); // 기본 칵테일, 재료 및 가니시 관련 퍼블릭 라우트

module.exports = router;
// src/routes/public/metaRoutes.js