CREATE DATABASE Flapper_Moonshine; # database Flapper_Moonshine

use Flapper_Moonshine;

# 관리자 테이블
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

# 유저 테이블
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,           -- 내부 고유 ID (게임 내 사용)
    google_sub VARCHAR(255) NOT NULL UNIQUE,          -- Google에서 제공한 고유 식별자 (sub)
    
    email VARCHAR(255),                               -- 이메일 (선택 저장)
    name VARCHAR(100),                                -- 이름 또는 닉네임
    profile_image TEXT,                               -- 구글 프로필 이미지 URL
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 가입 시각

    -- 게임 관련 필드
    play_time INT DEFAULT 0,                          -- 누적 플레이 시간 (초 단위)
    current_chapter INT DEFAULT 1,                    -- 진행 중인 챕터
    money INT DEFAULT 0,                              -- 게임 내 보유 화폐
    reputation_score INT DEFAULT 0,                   -- 평판 점수
    signature_cocktail_id INT DEFAULT NULL           -- 유저의 시그니처 칵테일

    #FOREIGN KEY (signature_cocktail_id) REFERENCES cocktail_recipe(recipe_id) ON DELETE SET NULL
);


CREATE TABLE ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    name_kr VARCHAR(255) NOT NULL UNIQUE,       -- 재료 이름 (한글)
    sweetness TINYINT NOT NULL,                 -- 단맛 정도 (0~5)
    sourness TINYINT NOT NULL,                  -- 신맛 정도 (0~5)
    bitterness TINYINT NOT NULL,                -- 쓴맛 정도 (0~5)
    flavor_category ENUM(
        'Citrus', 'Berry', 'Tropical', 'Nutty',
        'Sweet', 'Coffee', 'Herbal', 'Creamy'
    ) NOT NULL,
    abv INT NOT NULL                            -- 도수 (0~100 %)
);


# 칵테일 레시피 테이블`user`
CREATE TABLE cocktail_recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,

    -- 재료 (최대 4개)
    ingredient1_id INT NOT NULL,
    ingredient1_amount VARCHAR(50) NOT NULL,

    ingredient2_id INT,
    ingredient2_amount VARCHAR(50),

    ingredient3_id INT,
    ingredient3_amount VARCHAR(50),

    ingredient4_id INT,
    ingredient4_amount VARCHAR(50),

    -- 제조 정보
    method ENUM('shake', 'stir') NOT NULL,
    ice_in_shake BOOLEAN DEFAULT NULL,         -- 쉐이크일 때만 의미 있음
    is_on_the_rocks BOOLEAN DEFAULT FALSE,
    glass_type ENUM('long_drink', 'on_the_rocks', 'margarita', 'martini', 'sour', 'coupe') NOT NULL,
    abv INT,                                    -- Alcohol by Volume (%)

    -- 기타 정보
    summary TEXT,
    creator_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- 외래 키 연결 (ingredient 테이블)
    FOREIGN KEY (ingredient1_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient2_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient3_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (ingredient4_id) REFERENCES ingredient(ingredient_id)
    #FOREIGN KEY (creator_id) REFERENCES user(user_id) ON DELETE SET NULL
);

CREATE TABLE user_dialog_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,         -- 대화 세션 단위로 묶기 위해 추가
    user_id INT NOT NULL,
    npc_id VARCHAR(100) NOT NULL,
    speaker ENUM('user', 'npc') NOT NULL,    -- 누가 말했는지 구분
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- 추가 메타데이터 (선택)
    emotion_tag VARCHAR(50),                 -- 대화 감정 (optional)
    is_training_data BOOLEAN DEFAULT TRUE,   -- 학습에 사용할지 여부
    version_tag VARCHAR(50),                 -- 어떤 버전의 모델이 응답했는지

    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE training_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    npc_id VARCHAR(100) NOT NULL,
    base_model_version VARCHAR(50),    -- 학습 전 모델 버전
    new_model_version VARCHAR(50),     -- 학습 후 저장된 새 모델 버전
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    status ENUM('queued', 'training', 'done', 'failed') DEFAULT 'queued',
    notes TEXT,                        -- 관리자 메모 (optional)

    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

DROP TABLE user_dialog_logs;

# 외래키 등록
ALTER TABLE user
ADD CONSTRAINT fk_user_signature_cocktail
FOREIGN KEY (signature_cocktail_id) REFERENCES cocktail_recipe(recipe_id) ON DELETE SET NULL;

ALTER TABLE cocktail_recipe
ADD CONSTRAINT fk_recipe_creator
FOREIGN KEY (creator_id) REFERENCES user(user_id) ON DELETE SET NULL;

CREATE USER 'flapper'@'localhost' IDENTIFIED BY 'flapper123!';

GRANT ALL PRIVILEGES ON Flapper_Moonshine.* TO 'flapper'@'localhost'; -- 관리자 db 계정 만들고 모든 권환 부여 
FLUSH PRIVILEGES;

SELECT * FROM user;

