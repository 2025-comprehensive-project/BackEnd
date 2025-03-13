CREATE DATABASE Flapper_Moonshine;

USE Flapper_Moonshine;

SELECT * FROM admin;
SELECT * FROM USER;

# admin
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

# user
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    play_time INT DEFAULT 0,
    current_chapter INT DEFAULT 1,
    money INT DEFAULT 0,
    reputation_score INT DEFAULT 0
);

# cocktail recipe
CREATE TABLE cocktail_recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ingredients JSON NOT NULL,
    description TEXT,
    creator_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES user(user_id) ON DELETE SET NULL
);

# 중간 테이블 추가 (user의 시그니처 칵테일을 저장하는 역할)
CREATE TABLE user_signature_cocktail (
    user_id INT PRIMARY KEY,
    signature_cocktail_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (signature_cocktail_id) REFERENCES cocktail_recipe(recipe_id) ON DELETE CASCADE
);
