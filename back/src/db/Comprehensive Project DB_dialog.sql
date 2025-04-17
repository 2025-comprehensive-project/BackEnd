USE Flapper_Moonshine;

-- 대화 로그 테이블
CREATE TABLE user_dialogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    npc_id VARCHAR(100) NOT NULL,
    speaker ENUM('user', 'npc') NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

	-- 학습과 관련된 칼럼들
    emotion_tag VARCHAR(50),
    is_training_data BOOLEAN DEFAULT TRUE,
    version_tag VARCHAR(50),

    FOREIGN KEY (user_id) REFERENCES user(user_id)
);