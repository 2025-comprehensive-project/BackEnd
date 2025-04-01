use Flapper_Moonshine;

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
