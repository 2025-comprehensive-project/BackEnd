use Flapper_Moonshine;

-- 1. 유저(flappe‌r) 다시 생성
CREATE USER IF NOT EXISTS 'flapper'@'localhost' IDENTIFIED BY 'flapper123!';

GRANT ALL PRIVILEGES ON Flapper_Moonshine.* TO 'flapper'@'localhost';
FLUSH PRIVILEGES;

SELECT User, Host FROM mysql.user WHERE User = 'flapper';


# 유저 세이브 파일 별 대화 로그 조회, slot_id 수정

SELECT *
FROM user_dialog_logs
WHERE user_id = :user_id AND slot_id = :slot_id
ORDER BY created_at ASC;


# 관리자 기능= 특정 유저의 특정 세이브의 특정 npc 조회

SELECT 
  ts.base_model_version,
  ts.new_model_version AS current_model_version,
  ts.finished_at AS last_trained,
  cs.memory,
  cs.version_tag
FROM training_sessions ts
LEFT JOIN chatbot_state cs
  ON ts.user_id = cs.user_id 
 AND ts.slot_id = cs.slot_id 
 AND ts.npc_id = cs.npc_id
WHERE ts.user_id = :user_id 
  AND ts.slot_id = :slot_id 
  AND ts.npc_id = :npc_id
ORDER BY ts.finished_at DESC
LIMIT 1;

-- 재료 테이블 + 향미 조회
SELECT 
    i.ingredient_id,
    i.name AS ingredient_name,
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

-- 레시피 초기화
-- 1. 외래키 제약 조건 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 2. 테이블 초기화
TRUNCATE TABLE cocktail_recipe;

-- 3. 외래키 제약 조건 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;



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
ORDER BY cr.name COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE cocktail_recipe;
SET FOREIGN_KEY_CHECKS = 1;

SELECT * FROM cocktail_recipe
ORDER BY recipe_id asc;

UPDATE cocktail_recipe
SET ingredient1_id = 3
WHERE name = '코스모폴리탄';




