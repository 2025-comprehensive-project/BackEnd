import sys
import json
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# GPT-Neo 모델 로드 (처음 실행 시 시간이 걸림)
model_name = "EleutherAI/gpt-neo-1.3B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

def generate_response(prompt, max_length=100):
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids
    output = model.generate(input_ids, max_length=max_length, pad_token_id=tokenizer.eos_token_id)
    return tokenizer.decode(output[0], skip_special_tokens=True)

# Node.js에서 받은 입력 처리
if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())  # JSON 입력 받기
    message = input_data.get("message", "")
    if message:
        response = generate_response(message)
        print(json.dumps({"response": response}))  # JSON 형태로 출력
