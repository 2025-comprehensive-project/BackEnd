import torch
import os
from transformers import AutoTokenizer, AutoModelForCausalLM

# ✅ 모델 경로 (절대경로로 설정)
model_path = os.path.abspath(os.path.expanduser("~/v0.5src/ai/chatbot/trainer/tinyllama-korean-merged"))

# ✅ 모델과 토크나이저 로딩
tokenizer = AutoTokenizer.from_pretrained(
    model_path,
    local_files_only=True
)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    device_map="auto",
    local_files_only=True
)
model.eval()

# ✅ 테스트용 한글 프롬프트
prompt = "<|user|>\n좋아하는 음식은 뭐야?</s>\n<|assistant|>"

# ✅ 텍스트 생성
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
        repetition_penalty=1.1
    )

response = tokenizer.decode(outputs[0], skip_special_tokens=True)

# ✅ 결과 출력
print("\n✅ 모델 응답:")
print(response)
