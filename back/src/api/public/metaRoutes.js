const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  getIngredients,
  getGarnishes,
  getNoteCategories,
  getIngredientById 
} = require('./metaController');

router.use(adminAuth);

router.get('/ingredients', getIngredients);
router.get('/ingredients/:ingredient_id', getIngredientById );
router.get('/garnishes', getGarnishes);
router.get('/note-categories', getNoteCategories); 

module.exports = router;
