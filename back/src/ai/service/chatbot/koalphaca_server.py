from flask import Flask, request, jsonify
from transformers import pipeline, AutoModelForCausalLM
import torch
import json
import redis
import time

app = Flask(__name__)

# ✅ 모델 설정
MODEL_NAME = "beomi/KoAlpaca-Polyglot-5.8B"

# ✅ 모델 로딩
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True,
).to(device="cuda", non_blocking=True)
model.eval()

pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=MODEL_NAME,
    device=0
)

# ✅ Redis 설정
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

print("✅ 모델이 올라간 디바이스:", pipe.model.device)
if torch.cuda.is_available():
    print(f"✅ CUDA 사용 가능: {torch.cuda.get_device_name(0)}")
else:
    print("❌ CUDA 사용 불가: 현재 CPU에서 실행 중")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_id = data.get("user_id")
    message = data.get("message", "")

    if not user_id or not message:
        return jsonify({"error": "user_id와 message가 필요합니다."}), 400

    history_key = f"chat_history:{user_id}"
    history_json = redis_client.get(history_key)
    messages = []

    # ✅ Sylvia 캐릭터 system prompt → 첫 질문에 녹여서 자연스레 반영
    system_context = (
        "넌 1930년대 가상의 도시 뉴 랜싱턴의 라틴계 여성 노동운동가 실비아야. "
        "말투는 감정적이고 직설적이며, 상냥하기보단 진심이 담겨 있어. "
        "시원한 다이키리와 모히또를 좋아하고, 쓰고 센 술은 싫어해. "
        "진심을 담아 이야기하는 걸 좋아하고, 말에 가끔 불이 붙어. "
        "지금은 바에 앉아서 누군가와 대화 중이야."
    )

    # ✅ 이전 대화 불러오기
    if history_json:
        messages = json.loads(history_json)

    # ✅ 현재 메시지 추가
    messages.append({"role": "user", "content": message})

    # ✅ KoAlpaca 스타일 프롬프트 구성
    prompt = f"### 질문: {system_context}\n\n"
    for msg in messages:
        if msg["role"] == "user":
            prompt += f"### 질문: {msg['content']}\n\n"
        elif msg["role"] == "assistant":
            prompt += f"### 답변: {msg['content']}\n\n"
    prompt += "### 답변:"

    # ✅ 응답 생성
    start_time = time.time()
    output = pipe(
        prompt,
        max_new_tokens=150,
        do_sample=True,
        temperature=0.7,
        top_p=0.95,
        top_k=50,
        return_full_text=False,
        eos_token_id=2,
    )
    end_time = time.time()

    response = output[0]["generated_text"].strip()
    generation_time = round(end_time - start_time, 3)

    messages.append({"role": "assistant", "content": response})
    redis_client.set(history_key, json.dumps(messages[-6:]))

    return jsonify({
        "response": response,
        "generation_time": generation_time
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
