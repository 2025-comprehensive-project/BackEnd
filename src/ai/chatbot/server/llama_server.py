import os
import gc
import re
import torch
import warnings
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel

# ---------------------- 초기 설정 ----------------------

warnings.filterwarnings("ignore", category=FutureWarning)
app = Flask(__name__)

BASE_DIR = os.path.dirname(__file__)
MODEL_ID = "meta-llama/Llama-3.2-1B"
BASE_MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "models", "base"))
LORA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "models", "lora"))

port = int(os.environ.get("PORT", 50003))
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
if device.type != "cuda":
    raise RuntimeError("❌ CUDA GPU required")

# ---------------------- 모델 설정 ----------------------

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_ID,
    local_files_only=True,
    trust_remote_code=True,
)

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

# ---------------------- 버전 관리 유틸 ----------------------

npc_version_map = {}
lora_cache = {}
rola_cache = {}

def get_sorted_versions():
    if not os.path.isdir(BASE_MODELS_DIR):
        return []
    versions = [
        d for d in os.listdir(BASE_MODELS_DIR)
        if os.path.isdir(os.path.join(BASE_MODELS_DIR, d)) and d.startswith("v")
    ]
    return sorted(versions, reverse=True)

def get_all_npc_ids():
    pattern = re.compile(r'^([a-zA-Z0-9_]+)-v\d+\.\d+(?:\.\d+)?$')
    return {
        match.group(1)
        for name in os.listdir(LORA_DIR)
        if (match := pattern.match(name))
    } if os.path.isdir(LORA_DIR) else set()

def get_latest_lora_version(npc_id):
    pattern = re.compile(rf"^{re.escape(npc_id)}-v(\d+\.\d+(?:\.\d+)?)$")
    versions = [
        (name, tuple(map(int, match.group(1).split("."))))
        for name in os.listdir(LORA_DIR)
        if (match := pattern.match(name))
    ]
    return sorted(versions, key=lambda x: x[1], reverse=True)[0][0] if versions else None

# ---------------------- 모델 로딩 ----------------------

def try_load_model(version):
    model_path = os.path.join(BASE_MODELS_DIR, version)
    if not os.path.isfile(os.path.join(model_path, "config.json")):
        print(f"⚠️ {version} → config.json 없음")
        return None
    try:
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            device_map="auto",
            torch_dtype=torch.float16,
            quantization_config=bnb_config,
            local_files_only=True,
            trust_remote_code=True,
        )
        model.eval()
        return model
    except Exception as e:
        print(f"❌ 모델 로딩 실패 ({version}): {e}")
        return None

model = None
ACTIVE_BASE_VERSION = "default"
for version in get_sorted_versions():
    print(f"🧠 버전 시도 중: {version}")
    if model := try_load_model(version):
        ACTIVE_BASE_VERSION = version
        print(f"✅ 로딩 성공: {version}")
        break

if model is None:
    print("⚠️ 사전 학습된 모델 로딩 실패 → HF 모델 로딩")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        device_map="auto",
        torch_dtype=torch.float16,
        quantization_config=bnb_config,
        local_files_only=True,
        trust_remote_code=True,
    )
    model.eval()

# ---------------------- LoRA 어댑터 로딩 ----------------------

def apply_lora(base_model, npc_id):
    # 버전이 포함된 경우: e.g. silvia-v1.5.2
    version_path = os.path.join(LORA_DIR, npc_id)
    if os.path.isdir(version_path):
        version_dir_name = npc_id
    else:
        # 기존 방식: 자동 매핑 or 최신 버전 탐색
        version_dir_name = npc_version_map.get(npc_id) or get_latest_lora_version(npc_id)

    if not version_dir_name:
        raise ValueError(f"❌ {npc_id}의 LoRA 버전을 찾을 수 없습니다.")
    
    version_dir = os.path.join(LORA_DIR, version_dir_name)
    checkpoints = sorted([
        d for d in os.listdir(version_dir) if d.startswith("checkpoint-")
    ], key=lambda x: int(x.split("-")[1]))

    if not checkpoints:
        raise ValueError(f"❌ LoRA 체크포인트 없음: {version_dir}")

    lora_path = os.path.join(version_dir, checkpoints[-1])
    if not os.path.exists(os.path.join(lora_path, "adapter_config.json")):
        raise ValueError(f"❌ 어댑터 파일 누락: {lora_path}")

    print(f"🔄 LoRA 어댑터 로딩 중: {version_dir_name} → {lora_path}")
    peft_model = PeftModel.from_pretrained(
        base_model,
        lora_path,
        is_trainable=False,
        local_files_only=True
    )
    peft_model.eval()
    lora_cache[npc_id] = peft_model  # 캐시 키는 전체 요청된 문자열 기준
    return peft_model

# ---------------------- RoLA 어댑터 로딩 ----------------------

def apply_rola(base_model, npc_id, user_id, slot_id):
    key = (npc_id, str(user_id), str(slot_id))
    if key in rola_cache:
        return rola_cache[key]

    version = f"{npc_id}-{user_id}_{slot_id}"
    rola_path = os.path.join(BASE_DIR, "..", "models", "rola", version)

    if not os.path.exists(os.path.join(rola_path, "adapter_config.json")):
        print(f"⚠️ RoLA 어댑터 없음: {version}")
        return base_model

    print(f"🔄 RoLA 어댑터 로딩 중: {version}")
    peft_model = PeftModel.from_pretrained(
        base_model,
        rola_path,
        is_trainable=False,
        local_files_only=True
    )
    peft_model.eval()
    rola_cache[key] = peft_model
    return peft_model

# ---------------------- 텍스트 생성 유틸 ----------------------

def wrap_prompt_chatml(user_prompt: str) -> str:
    return f"<|user|>\n{user_prompt}</s>\n<|assistant|>\n"

def generate_text(prompt, model, max_new_tokens=200):
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    input_len = inputs.input_ids.shape[1]

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1
        )

    return tokenizer.decode(outputs[0][input_len:], skip_special_tokens=True)

def clean_response(text: str) -> str:
    import re

    # 💥 1. 특수 태그 및 깨진 토큰 제거
    text = re.sub(r'<[^<>]*>', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'</?s[^>\s.]*[>.\s]*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</?user[^>\s.]*[>.\s]*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</?r[^>\s.]*[>.\s]*', '', text, flags=re.IGNORECASE)

    # 💥 2. 텍스트 정리
    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    text = re.sub(r'\s{2,}', ' ', text)

    # 💥 3. <user> 이후 제거
    lower_text = text.lower()
    if '<user>' in lower_text:
        text = lower_text.split('<user>')[0]

    # 💥 4. 문장 두 개까지만 자르기 (마침표 뒤 공백 없어도 자르도록 수정)
    text = re.sub(r'([.!?])(?=[^\s])', r'\1 ', text)  # 마침표 뒤 공백 강제 삽입
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return ' '.join(sentences[:2]).strip()

# ---------------------- API 라우터 ----------------------

@app.route("/generate/<npc_id>", methods=["POST"])
def generate(npc_id):
    data = request.get_json()
    user_prompt = data.get("prompt", "")
    user_id = data.get("user_id")
    slot_id = data.get("slot_id")

    if not user_prompt:
        return jsonify({"error": "prompt는 필수입니다."}), 400

    try:
        prompt = wrap_prompt_chatml(user_prompt)

        model_version = "base"
        active_model = model

        # 🧠 LoRA 적용
        if npc_id != "base":
            active_model = apply_lora(model, npc_id)
            model_version = npc_version_map.get(npc_id, "latest")

        # 🧠 RoLA 적용
        if user_id is not None and slot_id is not None:
            rola_key = f"{npc_id}-{user_id}_{slot_id}"
            try:
                new_model = apply_rola(active_model, npc_id, user_id, slot_id)
                if new_model != active_model:
                    active_model = new_model
                    model_version = rola_key
                    print(f"✅ RoLA 어댑터 적용됨: {rola_key}")
                else:
                    print(f"⚠️ RoLA 어댑터 없음: fallback → LoRA 유지")
            except Exception as e:
                print(f"❌ RoLA 적용 중 예외 발생: {e}")

        # ✅ 최종 로그 출력
        print(f"🧾 [대화 요청] NPC: {npc_id}, 유저: {user_id}, 슬롯: {slot_id}, 적용 모델: {model_version}", flush=True)

        response_text = generate_text(prompt, active_model)
        cleaned_text = clean_response(response_text)
        return jsonify({"response": cleaned_text})

    except Exception as e:
        print(f"❌ 텍스트 생성 실패: {e}")
        return jsonify({"error": "텍스트 생성 실패"}), 500

@app.route("/status", methods=["GET"])
def status():
    return jsonify({
        "status": "running",
        "model": MODEL_ID,
        "active_base": ACTIVE_BASE_VERSION,
        "port": port,
        "cuda": torch.cuda.is_available(),
        "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "active_npcs": list(lora_cache.keys())
    })

@app.patch("/set-version")
def set_base_version():
    version = request.json.get("version")
    if not version:
        return jsonify({"error": "version required"}), 400

    base_dir = os.path.join(BASE_MODELS_DIR, version)
    if not os.path.isdir(base_dir) or not os.path.exists(os.path.join(base_dir, "config.json")):
        return jsonify({"error": "version_not_found"}), 404

    try:
        global model, lora_cache, ACTIVE_BASE_VERSION
        torch.cuda.empty_cache()
        gc.collect()

        new_model = AutoModelForCausalLM.from_pretrained(
            base_dir,
            device_map="auto",
            torch_dtype=torch.float16,
            quantization_config=bnb_config,
            local_files_only=True,
            trust_remote_code=True
        )
        new_model.eval()

        model = new_model
        lora_cache.clear()
        ACTIVE_BASE_VERSION = version

        return jsonify({"status": "ok", "active_base": version})
    except Exception as e:
        print(f"❌ 모델 교체 실패: {e}")
        return jsonify({"error": f"reload_failed: {e}"}), 500

@app.patch("/npc-version")
def set_npc_version():
    data = request.get_json()
    npc_id = data.get("npc_id")
    version = data.get("version")

    if not npc_id or not version:
        return jsonify({"error": "npc_id와 version은 필수입니다."}), 400

    version_path = os.path.join(LORA_DIR, version)
    if not os.path.isdir(version_path):
        return jsonify({"error": f"{version} 디렉토리가 존재하지 않습니다."}), 404

    npc_version_map[npc_id] = version
    print(f"✅ NPC 배포 버전 설정: {npc_id} → {version}")
    return jsonify({"status": "ok", "npc_id": npc_id, "version": version})

@app.route("/npc-version", methods=["GET"])
def get_npc_versions():
    return jsonify(npc_version_map)

# ---------------------- 초기화: NPC 버전 자동 매핑 ----------------------

print("📦 NPC 최신 LoRA 버전 자동 매핑 중...")
for npc_id in get_all_npc_ids():
    latest = get_latest_lora_version(npc_id)
    if latest:
        npc_version_map[npc_id] = latest
        print(f"🧠 {npc_id} → {latest}")
print("✅ 자동 매핑 완료\n")

# ---------------------- 서버 실행 ----------------------

if __name__ == "__main__":
    print(f"🚀 Flask Server is running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, threaded=True)

