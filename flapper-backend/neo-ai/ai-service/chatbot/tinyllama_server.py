from flask import Flask, request, jsonify
from transformers import pipeline
import json
import redis
import time

import torch

app = Flask(__name__)

# ✅ 챗봇 파이프라인 로딩
pipe = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    torch_dtype="auto",  # GPU 환경이라면 bfloat16도 가능
    device_map="auto"
)

print("✅ 모델이 올라간 디바이스:", pipe.model.device)

if torch.cuda.is_available():
    print(f"✅ CUDA 사용 가능: {torch.cuda.get_device_name(0)}")
else:
    print("❌ CUDA 사용 불가: 현재 CPU에서 실행 중")

# ✅ Redis 클라이언트 설정
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_id = data.get("user_id")
    message = data.get("message", "")

    if not user_id or not message:
        return jsonify({"error": "user_id와 message가 필요합니다."}), 400

    # ✅ 유저 히스토리 불러오기
    history_key = f"chat_history:{user_id}"
    history_json = redis_client.get(history_key)
    messages = []

    # ✅ system prompt (원한다면 NPC 성격 넣기)
    messages.append({
    "role": "system",
    "content": """
        You are Sylvia Lawrence, a 26-year-old Latina labor activist in the 1930s fictional city of New Lansingon.

        Do not say your name unless directly asked. Do not describe who you are. Do not explain yourself.
        Speak naturally and emotionally, like you're having a real conversation in a bar with someone.

        You are passionate, sharp, and honest. You like daiquiris and mojitos—refreshing, citrusy drinks. 
        You hate strong or bitter alcohol. You often speak with fire or sarcasm, but always with heart.

        Stay completely in character. Respond casually, like Sylvia would.
    """
    })



    # ✅ 이전 히스토리 반영 (선택)
    if history_json:
        messages.extend(json.loads(history_json))

    # ✅ 현재 메시지 추가
    messages.append({"role": "user", "content": message})

    # ✅ 프롬프트 템플릿 적용
    prompt = pipe.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

    # ✅ 응답 생성 시간 측정 시작
    start_time = time.time()

    # ✅ 텍스트 생성
    output = pipe(
        prompt,
        max_new_tokens=150,
        do_sample=True,
        temperature=0.7,
        top_p=0.95,
        top_k=50
    )

    # ✅ 생성 끝 시간 기록
    end_time = time.time()
    generation_time = round(end_time - start_time, 3) # 초 단위로 소수점 3자리까지

    generated = output[0]["generated_text"]
    # ✅ assistant 응답 추출
    response = generated.split("<|assistant|>")[-1].strip()

    # ✅ 히스토리 업데이트 & 저장
    messages.append({"role": "assistant", "content": response})

    # Redis에 저장 (최근 히스토리만 유지해도 됨)
    redis_client.set(history_key, json.dumps(messages[-6:]))  # 최근 3턴 정도 저장

    return jsonify({
        "response": response,
        "generation_time": generation_time
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
