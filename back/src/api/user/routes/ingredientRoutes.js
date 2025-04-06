const express = require('express');
const router = express.Router();
const userAuth = require('../../../middleware/googleAuth');
const {
  getUnlockedIngredients,
  unlockIngredient
} = require('../controllers/ingredientController');

router.use(userAuth);

// 유저가 해금한 재료 조회
router.get('/', getUnlockedIngredients);

// 유저가 재료 해금
router.post('/unlock-ingredient', unlockIngredient);

module.exports = router;
