USE Flapper_Moonshine;

DROP TABLE if exists note_category;

-- 데이터 삽입 (ID 없이 이름만 넣기!)
INSERT INTO note_category (name) VALUES
('Spirit'),
('Citrus'),
('Herbal'),
('Berry'),
('Tropical'),
('Sweet'),
('Coffee'),
('Smoky'),
('Spicy'),
('Nutty'),
('Plain');


-- 기주 먼저
INSERT INTO ingredient (name, sweetness, sourness, bitterness, abv) VALUES
('진', 0, 0, 2, 40),
('럼', 1, 0, 1, 40),
('보드카', 0, 0, 0, 40),
('위스키', 1, 0, 3, 40),
('브랜디', 2, 0, 1, 40),
('데킬라', 0, 1, 2, 40),
('압생트', 1, 0, 4, 40),
('문샤인', 0, 0, 2, 45);

INSERT INTO ingredient (name, sweetness, sourness, bitterness, abv) VALUES
('오렌지 리큐르', 4, 0, 3, 30),
('블루 큐라소', 4, 0, 3, 30),
('오렌지 주스', 4, 3, 0, 0),
('라임 주스', 0, 4, 2, 0),
('레몬 주스', 0, 5, 0, 0),
('체리 리큐르', 5, 0, 3, 25),
('크랜베리 주스', 2, 5, 0, 0),
('파인애플 주스', 4, 3, 0, 0),
('아몬드 리큐르', 5, 0, 3, 25),
('심플 시럽', 5, 0, 0, 0),
('커피 리큐르', 3, 0, 3, 20),
('허브 리큐르', 3, 0, 3, 35),
('드라이 베르무트', 0, 0, 5, 20),
('스위트 베르무트', 4, 0, 3, 15),
('비터스', 0, 0, 5, 45),
('우유', 4, 0, 0, 0),
('탄산수', 0, 0, 0, 0);

INSERT INTO ingredient (name, sweetness, sourness, bitterness, abv) VALUES
('그레나딘 시럽', 5, 2, 0, 0);

-- 기주에 향미 추가
INSERT INTO ingredient_note (ingredient_id, note_category_id) VALUES
(1, 1), (1, 3),     -- 진: Spirit + Herbal
(2, 1), (2, 6),     -- 럼: Spirit + Sweet
(3, 1), (3, 11),    -- 보드카: Spirit + Plain
(4, 1), (4, 8),     -- 위스키: Spirit + Smoky
(5, 1), (5, 6),     -- 브랜디: Spirit + Sweet
(6, 1), (6, 9),     -- 데킬라: Spirit + Spicy
(7, 1), (7, 3),     -- 압생트: Spirit + Herbal
(8, 1), (8, 8);     -- 문샤인: Spirit + Smoky

-- 나머지 재료에 향미 추가
INSERT INTO ingredient_note (ingredient_id, note_category_id) VALUES
(9, 2), (9, 6),           -- 오렌지 리큐르: Citrus, Sweet
(10, 2), (10, 6),         -- 블루 큐라소: Citrus, Sweet
(11, 2), (11, 6),         -- 오렌지 주스: Citrus, Sweet
(12, 2), (12, 9),         -- 라임 주스: Citrus, Spicy
(13, 2), (13, 6),         -- 레몬 주스: Citrus, Sweet
(14, 4), (14, 6),         -- 체리 리큐르: Berry, Sweet
(15, 4), (15, 2),         -- 크랜베리 주스: Berry, Citrus
(16, 5), (16, 6),         -- 파인애플 주스: Tropical, Sweet
(17, 10), (17, 6),        -- 아몬드 리큐르: Nutty, Sweet
(18, 6),                  -- 심플 시럽: Sweet
(19, 7), (19, 6),         -- 커피 리큐르: Coffee, Sweet
(20, 3), (20, 6),         -- 허브 리큐르: Herbal, Sweet
(21, 3),                  -- 드라이 베르뭇: Herbal
(22, 4), (22, 6),         -- 스위트 베르뭇: Berry, Sweet
(23, 3),                  -- 비터스: Herbal
(24, 11),                 -- 우유: Plain
(25, 11);                 -- 탄산수: Plain

INSERT INTO ingredient_note (ingredient_id, note_category_id) VALUES
(26, 4), (26, 6);         -- 그레나딘 시럽: Berry, Sweet

-- 가니시 추가
INSERT INTO garnish_type (name, note_category_id) VALUES
('레몬 필', 2),
('레몬 웨지', 2),
('레몬 슬라이스', 2),
('라임 필', 2),
('라임 웨지', 2),
('라임 슬라이스', 2),
('오렌지 필', 2),
('오렌지 웨지', 2),
('오렌지 슬라이스', 2),
('체리', 4),
('애플 민트', 3);


-- 칵테일 추가 SQL, 나머지는 CSV로 작성
INSERT INTO cocktail_recipe (
    name,
    ingredient1_id, ingredient1_amount,
    ingredient2_id, ingredient2_amount,
    ingredient3_id, ingredient3_amount,
    method, ice_in_shake, is_on_the_rocks,
    glass_type, abv,
    summary
) VALUES (
    '애비에이션',
    1, '1.5oz',     -- 진
    14, '0.5oz',    -- 체리 리큐르
    11, '1oz',      -- 레몬 주스
    'shake', TRUE, FALSE,
    'martini', 28,
    '상큼 달콤한 맛의 클래식 진 베이스 칵테일'
);


INSERT INTO cocktail_recipe (
    name,
    ingredient1_id, ingredient1_amount,
    ingredient2_id, ingredient2_amount,
    ingredient3_id, ingredient3_amount,
    method, ice_in_shake, is_on_the_rocks,
    glass_type, abv,
    summary
) VALUES (
    '알렉산더',
    5, '1oz',       -- 브랜디
    17, '1oz',      -- 아몬드 리큐르
    24, '2oz',      -- 우유
    'shake', TRUE, FALSE,
    'martini', 20,
    '부드럽고 고소한 맛의 디저트 스타일 칵테일'
);

