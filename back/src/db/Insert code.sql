USE db25103;

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
('탄산수', 0, 0, 0, 0),
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
(25, 11),                 -- 탄산수: Plain
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

UPDATE ingredient SET description = '허브와 향신료로 증류한 드라이하고 강렬한 술. 시원한 향이 특징이다.' WHERE ingredient_id = 1;
UPDATE ingredient SET description = '사탕수수로 만들어진 달콤하고 묵직한 향의 술. 열대 지역의 향취를 담고 있다.' WHERE ingredient_id = 2;
UPDATE ingredient SET description = '중립적이고 깔끔한 맛의 증류주. 어떤 재료와도 잘 섞인다.' WHERE ingredient_id = 3;
UPDATE ingredient SET description = '오크통에서 숙성된 깊은 풍미와 스모키한 향을 지닌 술.' WHERE ingredient_id = 4;
UPDATE ingredient SET description = '과실주를 증류하여 만든 달콤하고 부드러운 풍미의 고급 술.' WHERE ingredient_id = 5;
UPDATE ingredient SET description = '용설란에서 추출한 강렬하고 향긋한 술, 실은 본명이 따로 있다던데..' WHERE ingredient_id = 6;
UPDATE ingredient SET description = '쌉싸름한 향신료와 허브 향이 강하게 풍기는 녹색의 술. 천사인가, 악마인가.' WHERE ingredient_id = 7;
UPDATE ingredient SET description = '세 번 증류한 싸구려 증류주, 규칙 밖의 자유를 담고 있다. 과거 금주법 시절, 단속을 피해 달빛을 받으며 제조하였기에 이런 이름이 붙었다.' WHERE ingredient_id = 8;
UPDATE ingredient SET description = '상큼한 오렌지 향과 달콤한 맛이 어우러진 리큐르.' WHERE ingredient_id = 9;
UPDATE ingredient SET description = '푸른 색감이 인상적인 오렌지 리큐르. 칵테일에 시각적 매력을 더한다.' WHERE ingredient_id = 10;
UPDATE ingredient SET description = '새콤달콤한 오렌지 주스, 다수의 칵테일에서 재료로 자주 사용된다.' WHERE ingredient_id = 11;
UPDATE ingredient SET description = '신선한 라임을 짜서 만든 새콤씁쓸한 주스, 잘 어울리는 술이 있다던데, 이름이 뭐였더라..' WHERE ingredient_id = 12;
UPDATE ingredient SET description = '신선한 레몬을 짜서 만든 새콤달콤한 주스. 졸릴 땐 그냥 생으로 마셔보자.' WHERE ingredient_id = 13;
UPDATE ingredient SET description = '진한 체리향과 단맛이 어우러진 깊은 풍미의 리큐르. 금주법 시절, 약용목적으로 음용하곤  했다.' WHERE ingredient_id = 14;
UPDATE ingredient SET description = '신선한 크렌베리 주스, 새콤하면서도 상쾌한 베리 향이 매력적이다.' WHERE ingredient_id = 15;
UPDATE ingredient SET description = '열대의 신선한 파인애플 주스, 열대 과일 특유의 달콤함과 산뜻함이 조화를 이룬다.' WHERE ingredient_id = 16;
UPDATE ingredient SET description = '고소하고 달콤한 아몬드 향이 나는 리큐르. 실은 아몬드가 거의 안들어갔다.' WHERE ingredient_id = 17;
UPDATE ingredient SET description = '물과 설탕을 1:1로 녹인 단순한 감미료. 맛의 균형을 잡아준다. 그냥 설탕물 아니냐고?' WHERE ingredient_id = 18;
UPDATE ingredient SET description = '쌉싸름한 커피 향과 달콤함이 공존하는 리큐르. 무게감 있는 맛을 낸다.' WHERE ingredient_id = 19;
UPDATE ingredient SET description = '다양한 약초의 향을 응축한 리큐르. 복잡하고 묘한 여운을 남긴다. 이 정도면 약으로 쳐도 되지 않나?' WHERE ingredient_id = 20;
UPDATE ingredient SET description = '쌉싸름하고 깔끔한 허브 풍미의 주정 강화 와인.' WHERE ingredient_id = 21;
UPDATE ingredient SET description = '달콤함과 약초향이 절묘하게 어우러진 주정 강화 와인.' WHERE ingredient_id = 22;
UPDATE ingredient SET description = '약용 목적으로 만들어진 허브 추출물, 극소량으로도 전체 칵테일의 풍미를 조절한다. 이 녀석을 샷으로 마시는 클럽이 있다던데..' WHERE ingredient_id = 23;
UPDATE ingredient SET description = '신선한 우유, 부드럽고 크리미한 질감을 더해준다. 알콜의 거친 맛을 감싼다.' WHERE ingredient_id = 24;
UPDATE ingredient SET description = '청량감을 더해주는 무미의 탄산. 칵테일을 가볍게 만들어준다.' WHERE ingredient_id = 25;
UPDATE ingredient SET description = '석류로 만든 진한 단맛의 시럽. 붉은 색감과 달콤한 맛을 더한다.' WHERE ingredient_id = 26;
