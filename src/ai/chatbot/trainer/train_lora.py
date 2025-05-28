#!/usr/bin/env python3
# coding: utf-8

import argparse, os, json, torch, random
from datasets import Dataset
from transformers import (AutoTokenizer, AutoModelForCausalLM,
                          BitsAndBytesConfig, TrainingArguments)
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer

# ──────────────────────────── 인자 파서 ────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(description="LoRA 학습 (내장 프롬프트 + 단일 데이터셋)")
    p.add_argument("--base",      required=True, help="Base model path or name")
    p.add_argument("--data",      required=True, help="JSONL 데이터 파일 (첫 줄 = 프롬프트)")
    p.add_argument("--out",       required=True, help="LoRA adapter 저장 경로")
    p.add_argument("--epochs",    type=int,   default=3)
    p.add_argument("--lr",        type=float, default=2e-4)
    p.add_argument("--bsz",       type=int,   default=2)
    p.add_argument("--grad_acc",  type=int,   default=8)
    p.add_argument("--max_len",   type=int,   default=1024)
    p.add_argument("--split",     type=float, default=0.05, help="Validation split ratio")
    p.add_argument("--resume", action="store_true", help="(옵션) 체크포인트에서 이어서 학습")
    return p.parse_args()

# ──────────────────────── 데이터 처리 ─────────────────────────────

def load_chatml_dataset_with_prompt(path, val_ratio=0.05):
    with open(path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    prompt = lines[0]
    samples = [json.loads(line) for line in lines[1:]]

    def to_chatml_with_system(example):
        messages = example["messages"]
        messages.insert(0, {"role": "system", "content": prompt})
        text = ""
        for msg in messages:
            if msg["role"] == "system":
                continue  # 학습에 system 제외
            text += f"<|{msg['role']}|>\n{msg['content']}</s>\n"
        return {"text": text.strip()}

    random.shuffle(samples)
    split_idx = int(len(samples) * (1 - val_ratio))
    train_set = list(map(to_chatml_with_system, samples[:split_idx]))
    val_set   = list(map(to_chatml_with_system, samples[split_idx:]))
    return Dataset.from_list(train_set), Dataset.from_list(val_set)

# ──────────────────────── MAIN ─────────────────────────────

def main():
    args = parse_args()
    os.makedirs(args.out, exist_ok=True)

    # ✅ 데이터셋 불러오기 및 분할
    print(f"📁 데이터 로드 및 분할: {args.data} (val ratio={args.split})")
    ds_train, ds_eval = load_chatml_dataset_with_prompt(args.data, args.split)

    # ✅ 모델 및 토크나이저 로드
    bnb = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    )

    base_path = args.base  # ✅ 그대로 쓰면 됨

    tok = AutoTokenizer.from_pretrained(
        base_path, use_fast=False, local_files_only=True
    )

    tok = AutoTokenizer.from_pretrained(args.base, trust_remote_code=True)

    tok.pad_token = tok.eos_token

    base = AutoModelForCausalLM.from_pretrained(
        base_path,
        torch_dtype=torch.float16,
        device_map="auto",
        quantization_config=bnb,
        local_files_only=True,
    )

    base.enable_input_require_grads()

    # ✅ LoRA 설정
    lora_cfg = LoraConfig(
        r=8, lora_alpha=16, lora_dropout=0.05,
        bias="none", task_type="CAUSAL_LM"
    )
    model = get_peft_model(base, lora_cfg)

    trainer = SFTTrainer(
        model=model,
        train_dataset=ds_train,
        eval_dataset=ds_eval,
        tokenizer=tok,
        dataset_text_field="text",
        packing=False,
        max_seq_length=args.max_len,
        data_collator=None,
        args=TrainingArguments(
            output_dir=args.out,
            num_train_epochs=args.epochs,
            per_device_train_batch_size=args.bsz,
            gradient_accumulation_steps=args.grad_acc,
            learning_rate=args.lr,
            fp16=True,
            logging_steps=50,
            save_steps=500,
            report_to="none"
        )
    )

    for epoch in range(1, args.epochs + 1):
        trainer.train(resume_from_checkpoint=False)
        loss = trainer.evaluate().get("eval_loss", None)
        print(f"[LoRA] epoch {epoch}/{args.epochs} loss={loss:.4f}")

    trainer.save_model(args.out)
    print("✅ LoRA 어댑터 저장 완료:", args.out)

if __name__ == "__main__":
    main()
