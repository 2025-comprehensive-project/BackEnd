const db = require('../config/dbConnect');

// 🔹 모든 칵테일 조회
const getAllCocktails = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cocktail_recipe');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching cocktails:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔹 특정 칵테일 상세정보 조회
const getCocktailDetails = async (req, res) => {
    const { recipe_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT cr.*, cd.alcohol_content, cd.taste, cd.aroma, cd.color, cd.glass_type, cd.garnish
             FROM cocktail_recipe cr
             LEFT JOIN cocktail_details cd ON cr.recipe_id = cd.recipe_id
             WHERE cr.recipe_id = ?`, 
             [recipe_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cocktail not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching cocktail details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllCocktails, getCocktailDetails };
