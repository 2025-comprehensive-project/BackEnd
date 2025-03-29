const express = require('express');
const { getUserInfo, createUser } = require('../controllers/userController');
const router = express.Router();

router.get('/:user_id', getUserInfo);
router.post('/', createUser);

module.exports = router;
