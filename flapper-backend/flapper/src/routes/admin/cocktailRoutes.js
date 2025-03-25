const express = require('express');
const { getAllCocktails, getCocktailDetails } = require('../../controllers/admin/cocktailController');
const router = express.Router();

router.get('/', getAllCocktails);
router.get('/:recipe_id', getCocktailDetails);

module.exports = router;
