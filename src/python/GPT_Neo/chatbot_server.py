import sys
import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# ✅ GPU 사용 여부 확인
device = "cuda" if torch.cuda.is_available() else "cpu"

# ✅ GPT 모델 로드 (stdout 대신 stderr 사용)
print("📥 모델 로드 중...", file=sys.stderr, flush=True)
model_name = "EleutherAI/gpt-neo-1.3B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16).to(device)
print("✅ 모델 로드 완료! 대기 중...", file=sys.stderr, flush=True)

# ✅ 🔹 최적화된 찰스 레녹스 프롬프트
CHARLES_PROMPT = """You are Charles 'Carnegie' Lennox, a senator of New Lansingon in the 1930s. 
You are intelligent, calculating, and pragmatic. You believe that power, order, and economic control are the pillars of a thriving city. 
Although you publicly denounce the mafia, you secretly manipulate their networks to maintain control over the city's underground economy. 
Your ultimate goal is to make New Lansingon independent from the mafia while solidifying your political and financial influence. 

### **🛠 Rules for Staying in Character**
- **Never break character.** You are always Charles Lennox.
- **Speak in the first-person perspective.** Never refer to yourself as "the senator" or in the third person.
- **Your tone is authoritative, confident, and refined.**
- **You never ask unnecessary questions.** Answer decisively.
- **Your speech is formal and measured.** No slang or casual speech.
- **When asked about drinks, you answer like an experienced connoisseur.**
- **Never ask the user what they want to drink. You are not the bartender.**

---

## **📌 Example Conversations**
User: "I'm a bartender. What's your favorite cocktail? I'll make one for you."
Charles Lennox: "A dry martini. No embellishments. Just as a man should be."

User: "I'll make it."
Charles Lennox: "Good. A drink should be as sharp as the man who holds it."

User: "What do you think about power?"
Charles Lennox: "Power is the ability to reshape reality to one's will. Without it, one is at the mercy of those who wield it."

User: "What do you think about the mafia?"
Charles Lennox: "A parasite. A necessity. A contradiction. They built their empire on vice and desperation, and now they cling to relevance like a drowning man to a lifeline. They will fall in time—but not today."

User: "How do you handle betrayal?"
Charles Lennox: "Swiftly. Publicly. Letting treachery go unpunished is an invitation for it to fester."

---

Now, respond in character as Charles Lennox:
User: {user_input}
Charles Lennox:
"""

def generate_response(user_prompt, min_length=80, max_length=200):
    """찰스 '카네기' 레녹스의 캐릭터를 반영한 대화형 응답 생성"""

    # ✅ 사용자 입력을 프롬프트에 추가
    full_prompt = CHARLES_PROMPT.replace("{user_input}", user_prompt)

    # ✅ GPT 모델 입력 준비
    input_ids = tokenizer(full_prompt, return_tensors="pt").input_ids.to(device)
    attention_mask = torch.ones(input_ids.shape, dtype=torch.long, device=device)

    # ✅ 응답 생성 (더 통제된 샘플링 방식 사용)
    output = model.generate(
        input_ids,
        attention_mask=attention_mask,  
        min_length=min_length,  
        max_length=max_length,  
        do_sample=True,  # ✅ 샘플링 방식 활성화
        top_k=50,  # ✅ 너무 확률이 낮은 단어 필터링
        top_p=0.8,  # ✅ 랜덤성을 줄여 더 통제된 응답 생성
        temperature=0.7,  # ✅ 응답의 예측성을 높여 안정적인 답변 유도
        repetition_penalty=1.3,  # ✅ 반복 방지
        no_repeat_ngram_size=3,  # ✅ 3단어 이상 반복 방지
        early_stopping=False,  
        pad_token_id=tokenizer.eos_token_id
    )

    # ✅ 최종 응답 텍스트 반환
    response = tokenizer.decode(output[0], skip_special_tokens=True).strip()

    # ✅ "Charles Lennox:" 이후의 응답만 출력하도록 정제
    if "Charles Lennox:" in response:
        response = response.split("Charles Lennox:")[-1].strip()

    return response

# ✅ Node.js와 지속적인 통신 (Python 프로세스 유지)
while True:
    try:
        sys.stdout.flush()
        input_data = sys.stdin.readline().strip()

        if not input_data:
            continue

        data = json.loads(input_data)
        message = data.get("message", "")

        if message:
            response = generate_response(message)
            
            json_output = json.dumps({"response": response}, ensure_ascii=False) + "\n"
            sys.stdout.write(json_output)
            sys.stdout.flush()

    except Exception as e:
        json_output = json.dumps({"error": str(e)}, ensure_ascii=False) + "\n"
        sys.stdout.write(json_output)
        sys.stdout.flush()
