// src/routes/admin/loginRoutes.js
const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/loginController');

router.post('/', adminLogin);

module.exports = router;
