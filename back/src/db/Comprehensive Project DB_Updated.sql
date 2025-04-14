DROP DATABASE IF EXISTS Flapper_Moonshine;

-- DATABASE: Flapper_Moonshine
CREATE DATABASE Flapper_Moonshine;
USE Flapper_Moonshine;

-- 관리자 테이블
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 유저 테이블 (게임 데이터는 user_save로 분리됨)
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    google_sub VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    name VARCHAR(100),
    profile_image TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    signature_cocktail_id INT DEFAULT NULL
);

-- 유저 세이브 슬롯 테이블
CREATE TABLE user_save (
    save_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    play_time INT DEFAULT 0,
    chapter INT DEFAULT 1,
    in_game_day INT,
    money INT DEFAULT 0,
    reputation_score INT DEFAULT 0,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, slot_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 노트 카테고리 테이블
CREATE TABLE note_category (
    note_category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE  -- 예: Citrus, Herbal 등
);

-- 재료 테이블
CREATE TABLE ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    sweetness TINYINT NOT NULL,
    sourness TINYINT NOT NULL,
    bitterness TINYINT NOT NULL,
    abv INT NOT NULL
);

ALTER TABLE ingredient
ADD COLUMN description TEXT AFTER name;

-- 재료와 향미를 연결하는 다대다 관계 테이블
CREATE TABLE ingredient_note (
    ingredient_id INT NOT NULL,
    note_category_id INT NOT NULL,
    PRIMARY KEY (ingredient_id, note_category_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (note_category_id) REFERENCES note_category(note_category_id) ON DELETE CASCADE
);

-- 가니시 테이블
CREATE TABLE garnish_type (
    garnish_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    note_category_id INT NOT NULL,

    FOREIGN KEY (note_category_id) REFERENCES note_category(note_category_id) ON DELETE RESTRICT
);

-- 칵테일 레시피 테이블
CREATE TABLE cocktail_recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,

    ingredient1_id INT NOT NULL,
    ingredient1_amount VARCHAR(50) NOT NULL,
    ingredient2_id INT,
    ingredient2_amount VARCHAR(50),
    ingredient3_id INT,
    ingredient3_amount VARCHAR(50),
    ingredient4_id INT,
    ingredient4_amount VARCHAR(50),
    garnish_id INT DEFAULT NULL,
    method ENUM('shake', 'stir') NOT NULL,
    ice_in_shake BOOLEAN DEFAULT NULL,
    is_on_the_rocks BOOLEAN DEFAULT FALSE,
    glass_type ENUM('long_drink', 'on_the_rocks', 'margarita', 'martini', 'sour', 'coupe') NOT NULL,
    abv INT,

    summary TEXT,
    comments TEXT,
    creator_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ingredient1_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient2_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient3_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient4_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (garnish_id) REFERENCES garnish_type(garnish_id)
);

-- 유저 별 해금된 재료 저장 테이블
CREATE TABLE unlocked_ingredient (
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    
    PRIMARY KEY (user_id, slot_id, ingredient_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)
);

-- 가구 테이블
CREATE TABLE furniture (
    furniture_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,        -- 가구 이름
    description TEXT,                  -- 설명
    price INT NOT NULL DEFAULT 0       -- 가격 (게임 내 화폐 단위)
);

CREATE TABLE user_furniture (
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    furniture_id INT NOT NULL,

    PRIMARY KEY (user_id, slot_id, furniture_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (furniture_id) REFERENCES furniture(furniture_id)
);

-- LP 테이블
CREATE TABLE long_playing_record (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,        -- LP 이름
    description TEXT,                  -- 설명
    price INT NOT NULL DEFAULT 0       -- 가격
);

CREATE TABLE user_long_playing_record (
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    record_id INT NOT NULL,

    PRIMARY KEY (user_id, slot_id, record_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES long_playing_record(record_id)
);

-- ALTER 버전
ALTER TABLE user_save
ADD COLUMN in_game_day INT;

-- 외래키 연결 (user → cocktail_recipe)
ALTER TABLE user
ADD CONSTRAINT fk_user_signature_cocktail
FOREIGN KEY (signature_cocktail_id) REFERENCES cocktail_recipe(recipe_id) ON DELETE SET NULL;

-- 외래키 연결 (cocktail_recipe → user)
ALTER TABLE cocktail_recipe
ADD CONSTRAINT fk_recipe_creator
FOREIGN KEY (creator_id) REFERENCES user(user_id) ON DELETE SET NULL;
















-- 아직 유저 다이어로그, 트레이닝 세션, 챗봇 상태 안넣음. 


