const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/userLoginController');

router.post('/login/google', googleLogin);

module.exports = router;
