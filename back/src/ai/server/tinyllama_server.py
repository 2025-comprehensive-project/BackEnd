from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__)

# ✅ 모델 경로 (이미 다운로드되어 캐시에 있음)
MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# ✅ 디바이스 설정 (GPU 우선)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ✅ 모델 및 토크나이저 로딩
print("🚀 Loading model and tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"  # CUDA 자동 할당
)
model.eval()

# ✅ 텍스트 생성 함수
def generate_text(prompt, max_new_tokens=200):
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1
        )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# ✅ POST 요청 처리: /generate
@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    response = generate_text(prompt)
    return jsonify({"response": response})

# ✅ 상태 확인: /health
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running"})

# ✅ 서버 실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
