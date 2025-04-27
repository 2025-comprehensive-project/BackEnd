# ===========================================
# TinyLlama 한글 대화 모델 병합 스크립트
# ===========================================

from transformers import AutoModelForCausalLM
from peft import PeftModel
import torch

# ✅ 경로 설정
base_model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
lora_output_dir = "./tinyllama-korean-output"  # LoRA 학습 결과 저장 경로
merged_output_dir = "./tinyllama-korean-merged"  # 병합된 모델 저장 경로

# ✅ Base TinyLlama 모델 로딩
print("✅ Base 모델 로딩 중...")
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_id,
    device_map="auto",
    torch_dtype=torch.float16,
    trust_remote_code=True
)

# ✅ LoRA 어댑터 로딩
print("✅ LoRA 어댑터 로딩 중...")
lora_model = PeftModel.from_pretrained(
    base_model,
    lora_output_dir,
    device_map="auto"
)

# ✅ 병합 (merge_and_unload)
print("✅ Base + LoRA 병합 시작...")
merged_model = lora_model.merge_and_unload()

# ✅ 병합된 모델 저장
print(f"✅ 병합된 모델 저장 중... {merged_output_dir}")
merged_model.save_pretrained(merged_output_dir)

print("✅ TinyLlama 한글 대화 모델 병합 및 저장 완료!")
