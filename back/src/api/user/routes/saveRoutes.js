const express = require('express');
const router = express.Router();
const { loadSaveData } = require('../controllers/saveController');

router.post('/load', loadSaveData);

module.exports = router;
