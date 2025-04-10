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

-- 재료 테이블
CREATE TABLE ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    name_kr VARCHAR(255) NOT NULL UNIQUE,
    sweetness TINYINT NOT NULL,
    sourness TINYINT NOT NULL,
    bitterness TINYINT NOT NULL,
    flavor_category ENUM(
        'Citrus', 'Berry', 'Tropical', 'Nutty',
        'Sweet', 'Coffee', 'Herbal', 'Creamy'
    ) NOT NULL,
    abv INT NOT NULL
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

    method ENUM('shake', 'stir') NOT NULL,
    ice_in_shake BOOLEAN DEFAULT NULL,
    is_on_the_rocks BOOLEAN DEFAULT FALSE,
    glass_type ENUM('long_drink', 'on_the_rocks', 'margarita', 'martini', 'sour', 'coupe') NOT NULL,
    abv INT,

    summary TEXT,
    creator_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ingredient1_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient2_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient3_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient4_id) REFERENCES ingredient(ingredient_id)
);

ALTER TABLE ingredient
CHANGE COLUMN flavor_category note_category ENUM(
    'Citrus', 'Berry', 'Tropical', 'Nutty',
    'Sweet', 'Coffee', 'Herbal', 'Creamy'
) NOT NULL;

SELECT * FROM ingredient;

CREATE TABLE garnish_type (
    garnish_id INT AUTO_INCREMENT PRIMARY KEY,
    name_kr VARCHAR(50) NOT NULL,     -- 예: "레몬 필"
    note_category ENUM(
        'Citrus', 'Berry', 'Tropical', 'Nutty',
        'Sweet', 'Coffee', 'Herbal', 'Creamy'
    ) NOT NULL
);

ALTER TABLE cocktail_recipe
ADD COLUMN garnish_id INT DEFAULT NULL,
ADD CONSTRAINT fk_garnish_type
    FOREIGN KEY (garnish_id) REFERENCES garnish_type(garnish_id);

-- 유저 세이브 슬롯 테이블
CREATE TABLE user_save (
    save_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    play_time INT DEFAULT 0,
    chapter INT DEFAULT 1,
    money INT DEFAULT 0,
    reputation_score INT DEFAULT 0,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, slot_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 대화 로그 테이블
CREATE TABLE user_dialog_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    npc_id VARCHAR(100) NOT NULL,
    speaker ENUM('user', 'npc') NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    emotion_tag VARCHAR(50),
    is_training_data BOOLEAN DEFAULT TRUE,
    version_tag VARCHAR(50),

    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- 챗봇 학습 세션 테이블
CREATE TABLE training_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    npc_id VARCHAR(100) NOT NULL,
    base_model_version VARCHAR(50),
    new_model_version VARCHAR(50),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    status ENUM('queued', 'training', 'done', 'failed') DEFAULT 'queued',
    notes TEXT,

    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- 챗봇 상태 테이블
CREATE TABLE chatbot_state (
    state_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    npc_id VARCHAR(100) NOT NULL,
    
    memory JSON DEFAULT NULL,
    version_tag VARCHAR(50),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE(user_id, slot_id, npc_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 외래키 연결 (user → cocktail_recipe)
ALTER TABLE user
ADD CONSTRAINT fk_user_signature_cocktail
FOREIGN KEY (signature_cocktail_id) REFERENCES cocktail_recipe(recipe_id) ON DELETE SET NULL;

-- 외래키 연결 (cocktail_recipe → user)
ALTER TABLE cocktail_recipe
ADD CONSTRAINT fk_recipe_creator
FOREIGN KEY (creator_id) REFERENCES user(user_id) ON DELETE SET NULL;

-- DB 계정 생성 및 권한 부여
CREATE USER 'flapper'@'localhost' IDENTIFIED BY 'flapper123!';
GRANT ALL PRIVILEGES ON Flapper_Moonshine.* TO 'flapper'@'localhost';
FLUSH PRIVILEGES;
ALTER TABLE user
ADD CONSTRAINT fk_user_signature_cocktail
FOREIGN KEY (signature_cocktail_id) REFERENCES cocktail_recipe(recipe_id) ON DELETE SET NULL;

-- 외래키 연결 (cocktail_recipe → user)
ALTER TABLE cocktail_recipe
ADD CONSTRAINT fk_recipe_creator
FOREIGN KEY (creator_id) REFERENCES user(user_id) ON DELETE SET NULL;

-- DB 계정 생성 및 권한 부여
CREATE USER 'flapper'@'localhost' IDENTIFIED BY 'flapper123!';
GRANT ALL PRIVILEGES ON Flapper_Moonshine.* TO 'flapper'@'localhost';
FLUSH PRIVILEGES;
