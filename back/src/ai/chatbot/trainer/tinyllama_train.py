# ===========================================
# TinyLlama 한글 대화 데이터 SFT 통합 스크립트
# (데이터 컨버팅 + 학습까지 한번에)
# ===========================================

import os
import json
import torch
from datasets import load_dataset, Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    TrainingArguments
)
from peft import LoraConfig
from trl import SFTTrainer

# ✅ 경로 설정
raw_train_path = "../data/converted_train.jsonl"          # [원본] input/output 데이터
raw_val_path = "../data/converted_val.jsonl"

converted_train_path = "../data/chatConverted_train.jsonl"  # [변환 후] ChatML 포맷
converted_val_path = "../data/chatConverted_val.jsonl"

model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
output_dir = "./tinyllama-korean-output"

# ✅ ChatML 포맷 변환 함수
def convert_to_chatml(input_text, output_text) -> str:
    return f"<|user|>\n{input_text}</s>\n<|assistant|>\n{output_text}</s>"

# ✅ 데이터 컨버팅 함수
def convert_dataset(raw_path, save_path):
    new_data = []
    with open(raw_path, 'r', encoding='utf-8') as f:
        for line in f:
            item = json.loads(line)
            text = convert_to_chatml(item["input"], item["output"])
            new_data.append({"text": text})

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, 'w', encoding='utf-8') as f:
        for item in new_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"✅ 변환 완료: {save_path} 저장됨")

# ✅ 원본 데이터 → ChatML 포맷 변환
convert_dataset(raw_train_path, converted_train_path)
convert_dataset(raw_val_path, converted_val_path)

# ✅ 데이터 로딩
def prepare_dataset(jsonl_path):
    dataset = load_dataset('json', data_files=jsonl_path, split='train')
    return dataset

train_dataset = prepare_dataset(converted_train_path)
val_dataset = prepare_dataset(converted_val_path)

# ✅ 모델 + 토크나이저 로딩
def get_model_and_tokenizer(model_id):
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    )

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )

    model.config.use_cache = False
    model.config.pretraining_tp = 1
    return model, tokenizer

model, tokenizer = get_model_and_tokenizer(model_id)

# ✅ LoRA 설정
peft_config = LoraConfig(
    r=8,
    lora_alpha=16,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# ✅ 학습 인자 설정
training_arguments = TrainingArguments(
    output_dir=output_dir,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    optim="paged_adamw_32bit",
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    save_strategy="epoch",
    evaluation_strategy="epoch",
    logging_steps=10,
    num_train_epochs=3,
    max_steps=250,  # 필요시 조정
    fp16=True
)

# ✅ SFTTrainer로 학습
trainer = SFTTrainer(
    model=model,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    args=training_arguments,
    tokenizer=tokenizer,
    packing=False,
    max_seq_length=512
)

# ✅ 학습 시작
trainer.train()

# ✅ 학습 후 모델 저장
trainer.save_model()

print("✅ TinyLlama 한글 대화 전체 파이프라인 완료!")
