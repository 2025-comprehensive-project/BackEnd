// src/routes/public/index.js
const express = require('express');
const router = express.Router();

const metaRoutes = require('./metaRoutes');

router.use('/meta', metaRoutes); // /api/public/...

module.exports = router;
// src/routes/public/metaRoutes.js