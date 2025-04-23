import json
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from peft import get_peft_model, LoraConfig, TaskType
import torch

# ✅ 관리자 웹에서 전달받을 수 있는 주요 하이퍼파라미터 (변수로 분리)
NUM_EPOCHS = 3
BATCH_SIZE = 4
LEARNING_RATE = 5e-5
LORA_RANK = 8
LORA_DROPOUT = 0.1

# ✅ 모델 및 토크나이저 로딩
model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(model_id)

if torch.cuda.is_available():
    print(f"✅ CUDA 디바이스: {torch.cuda.get_device_name(0)}")
    device_map = {"": 0}
    dtype = torch.float16
else:
    print("❌ CUDA 사용 불가. CPU로 전환합니다.")
    device_map = "auto"
    dtype = torch.float32

model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=dtype, device_map=device_map)

# ✅ LoRA 설정
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=LORA_RANK,
    lora_alpha=16,
    lora_dropout=LORA_DROPOUT,
    bias="none"
)
model = get_peft_model(model, lora_config)

# ✅ 데이터 로드
data_files = {"train": "../data/train.jsonl", "validation": "../data/val.jsonl"}
dataset = load_dataset("json", data_files=data_files)

def preprocess_conversation(example):
    conversation = example["messages"]
    text = "[INST]\n"
    for msg in conversation:
        role = msg.get("role", "").capitalize()
        content = msg.get("content", "")
        text += f"{role}: {content}\n"
    text += "[/INST]"
    return {"text": text}

dataset = dataset.map(preprocess_conversation, remove_columns=["messages"])

def tokenize_function(example):
    return tokenizer(example["text"], truncation=True, padding="max_length", max_length=512)

tokenized_dataset = dataset.map(tokenize_function, batched=True, remove_columns=["text"])

data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

# ✅ TrainingArguments (명시적 설정 반영)
training_args = TrainingArguments(
    output_dir="./tinyllama_finetune_output",
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    num_train_epochs=NUM_EPOCHS,
    learning_rate=LEARNING_RATE,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    fp16=torch.cuda.is_available(),
    logging_dir="./logs",
    save_total_limit=2,
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["validation"],
    data_collator=data_collator,
)

trainer.train()

model.save_pretrained("./tinyllama_finetuned")
tokenizer.save_pretrained("./tinyllama_finetuned")
