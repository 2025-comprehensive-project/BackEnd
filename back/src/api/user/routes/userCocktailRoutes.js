// src/api/user/routes/userCocktailRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/userAuth');
const {
    getUserCocktails
} = require('../controllers/userCocktailController');

// 유저 시그니처 칵테일 목록 조회
// GET /api/users/cocktails/signature
router.get('/signature', auth, getUserCocktails);

module.exports = router;
