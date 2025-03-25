const express = require('express');
const { getUserInfo, createUser } = require('../../controllers/admin/userController');
const router = express.Router();

router.get('/:user_id', getUserInfo);
router.post('/', createUser);

module.exports = router;
