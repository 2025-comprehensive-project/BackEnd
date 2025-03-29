const express = require('express');
const router = express.Router();

const aiRoutes = require('./aiRoutes');
const userRoutes = require('./userRoutes');
const loginRoutes = require('./loginRoutes');
const cocktailRoutes = require('./cocktailRoutes');

router.use('/ai', aiRoutes);             // /api/admin/ai/...
router.use('/users', userRoutes);
router.use('/login', loginRoutes);
router.use('/cocktails', cocktailRoutes);

module.exports = router;
