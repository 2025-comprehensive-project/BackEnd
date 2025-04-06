const db = require('../../../config/dbConnect');

// 재료 목록
const getIngredients = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
          i.ingredient_id,
          i.name,
          i.sweetness,
          i.sourness,
          i.bitterness,
          i.abv,
          GROUP_CONCAT(n.name SEPARATOR ', ') AS note_categories
      FROM 
          ingredient i
      LEFT JOIN 
          ingredient_note inote ON i.ingredient_id = inote.ingredient_id
      LEFT JOIN 
          note_category n ON inote.note_category_id = n.note_category_id
      GROUP BY 
          i.ingredient_id, i.name, i.sweetness, i.sourness, i.bitterness, i.abv
      ORDER BY 
          i.ingredient_id ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching detailed ingredients:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};


// 가니시 목록
const getGarnishes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
          g.garnish_id,
          g.name AS garnish_name,
          nc.name AS note_category
      FROM 
          garnish_type g
      JOIN 
          note_category nc ON g.note_category_id = nc.note_category_id
      ORDER BY 
          g.garnish_id ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching garnishes with note categories:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};


// 향미 카테고리 목록 (필요 시)
const getNoteCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT note_category_id, name FROM note_category ORDER BY note_category_id ASC');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching note categories:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};

module.exports = {
  getIngredients,
  getGarnishes,
  getNoteCategories
};
