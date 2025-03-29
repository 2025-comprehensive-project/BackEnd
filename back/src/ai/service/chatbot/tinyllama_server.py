from flask import Flask, request, jsonify
from transformers import pipeline
import torch
import redis
import json
import time

app = Flask(__name__)

# ✅ 모델 설정
MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# ✅ 파이프라인 로딩
pipe = pipeline(
    "text-generation",
    model=MODEL_NAME,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"
)

print("✅ 모델이 올라간 디바이스:", pipe.model.device)
if torch.cuda.is_available():
    print(f"✅ CUDA 사용 가능: {torch.cuda.get_device_name(0)}")
else:
    print("❌ CUDA 사용 불가: 현재 CPU에서 실행 중")

# ✅ Redis 설정
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

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

    # ✅ Sylvia 캐릭터 system message
    messages.append({
        "role": "system",
        "content": """
        You are Sylvia Lawrence, a 26-year-old Latina labor activist in the 1930s fictional city of New Lansingon.
        Speak naturally and emotionally, as if talking to a customer at the bar. You're passionate, honest, and witty.
        """
    })

    if history_json:
        messages.extend(json.loads(history_json))

    messages.append({"role": "user", "content": message})

    # ✅ TinyLlama는 chat template 지원함!
    prompt = pipe.tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    # ✅ 응답 생성
    start_time = time.time()
    output = pipe(
        prompt,
        max_new_tokens=150,
        do_sample=True,
        temperature=0.7,
        top_p=0.95,
        top_k=50
    )
    end_time = time.time()
    generation_time = round(end_time - start_time, 3)

    response = output[0]["generated_text"].split("<|assistant|>")[-1].strip()
    messages.append({"role": "assistant", "content": response})

    redis_client.set(history_key, json.dumps(messages[-6:]))

    return jsonify({
        "response": response,
        "generation_time": generation_time
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
