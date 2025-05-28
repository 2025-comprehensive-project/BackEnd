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
    p = argparse.ArgumentParser(description="RoLA 학습 (유저 슬롯 기반)")
    p.add_argument("--base",      required=True, help="Base 모델 경로")
    p.add_argument("--lora",      help="기존 LoRA 어댑터 경로 (선택)")
    p.add_argument("--data",      required=True, help="ChatML JSONL 경로")
    p.add_argument("--out",       required=True, help="출력 디렉토리")
    p.add_argument("--epochs",    type=int,   default=3)
    p.add_argument("--lr",        type=float, default=2e-4)
    p.add_argument("--bsz",       type=int,   default=2)
    p.add_argument("--grad_acc",  type=int,   default=8)
    p.add_argument("--max_len",   type=int,   default=1024)
    p.add_argument("--split",     type=float, default=0.05)
    p.add_argument("--resume", action="store_true")
    return p.parse_args()

# ──────────────────────────── 데이터 로딩 ────────────────────────────

def load_chatml(path, val_ratio=0.05):
    with open(path, "r", encoding="utf-8") as f:
        lines = [json.loads(line.strip()) for line in f if line.strip()]

    def to_text(example):
        text = ""
        for msg in example["messages"]:
            text += f"<|{msg['role']}|>\n{msg['content']}</s>\n"
        return {"text": text.strip()}

    random.shuffle(lines)
    split_idx = int(len(lines) * (1 - val_ratio))
    train = list(map(to_text, lines[:split_idx]))
    val   = list(map(to_text, lines[split_idx:]))
    return Dataset.from_list(train), Dataset.from_list(val)

# ──────────────────────────── MAIN ────────────────────────────

def main():
    args = parse_args()
    os.makedirs(args.out, exist_ok=True)

    print(f"📁 데이터 로딩 중: {args.data}")
    ds_train, ds_eval = load_chatml(args.data, args.split)

    bnb = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    )

    tok = AutoTokenizer.from_pretrained(
    args.base,
    local_files_only=True,
    trust_remote_code=True
    )
    tok.pad_token = tok.eos_token

    base = AutoModelForCausalLM.from_pretrained(
        args.base,
        torch_dtype=torch.float16,
        device_map="auto",
        quantization_config=bnb,
        local_files_only=False
    )

    if args.lora:
        print(f"🔄 LoRA 어댑터 적용 중: {args.lora}")
        from peft import PeftModel
        base = PeftModel.from_pretrained(
            base,
            args.lora,
            is_trainable=False,
            local_files_only=False
        )

    base.enable_input_require_grads()

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
        trainer.train(resume_from_checkpoint=args.resume)
        loss = trainer.evaluate().get("eval_loss", None)
        print(f"[RoLA] epoch {epoch}/{args.epochs} loss={loss:.4f}")

    trainer.save_model(args.out)
    print("✅ RoLA 어댑터 저장 완료:", args.out)

if __name__ == "__main__":
    main()
