use Flapper_Moonshine;

-- 레시피 확인 JOIN 문
SELECT 
    cr.recipe_id,
    cr.name AS cocktail_name,
    i1.name AS ingredient1,
    cr.ingredient1_amount,
    i2.name AS ingredient2,
    cr.ingredient2_amount,
    i3.name AS ingredient3,
    cr.ingredient3_amount,
    i4.name AS ingredient4,
    cr.ingredient4_amount,
    g.name AS garnish,
    cr.method,
    cr.ice_in_shake,
    cr.is_on_the_rocks,
    cr.glass_type,
    cr.abv,
    
    cr.summary,
    cr.created_at
FROM cocktail_recipe cr
LEFT JOIN ingredient i1 ON cr.ingredient1_id = i1.ingredient_id
LEFT JOIN ingredient i2 ON cr.ingredient2_id = i2.ingredient_id
LEFT JOIN ingredient i3 ON cr.ingredient3_id = i3.ingredient_id
LEFT JOIN ingredient i4 ON cr.ingredient4_id = i4.ingredient_id
LEFT JOIN garnish_type g ON cr.garnish_id = g.garnish_id
ORDER BY cr.name COLLATE UTF8MB4_UNICODE_CI;

-- 재료 테이블 + 향미 조회
SELECT 
    i.ingredient_id,
    i.name AS ingredient_name,
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
    i.ingredient_id, i.name
ORDER BY 
    i.ingredient_id;

-- 가니시 테이블 + 향미 조회
SELECT 
    g.garnish_id,
    g.name AS garnish_name,
    nc.name AS note_category
FROM 
    garnish_type g
JOIN 
    note_category nc ON g.note_category_id = nc.note_category_id
ORDER BY 
    g.garnish_id;