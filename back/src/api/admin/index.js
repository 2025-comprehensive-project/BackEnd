const express = require('express');
const router = express.Router();

const adminRoutes = require('./routes');

router.use('/', adminRoutes); // /api/admin/...

module.exports = router;
