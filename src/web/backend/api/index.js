const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin');
const userRoutes = require('./user');
const publicRoutes = require('./public');

router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/public', publicRoutes);

module.exports = router;
