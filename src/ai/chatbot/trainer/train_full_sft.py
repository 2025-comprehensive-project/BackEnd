#!/usr/bin/env python3
# coding: utf-8
"""
Base 모델 풀 튜닝 (SFT) 스크립트
trainManager.js → spawn("python", [...]) 로 호출됨
"""

import argparse, os, torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer, AutoModelForCausalLM,
    TrainingArguments, DataCollatorForLanguageModeling,
    BitsAndBytesConfig
)
from trl import SFTTrainer


# ───────────────────────── CLI 파서 ─────────────────────────
def parse_args():
    p = argparse.ArgumentParser(description="Run Full-SFT training")
    p.add_argument("--base",      required=True, help="Base model path or HF ID")
    p.add_argument("--out",       required=True, help="Output directory for trained model")
    p.add_argument("--epochs",    type=int,   default=3,     help="Epochs")
    p.add_argument("--lr",        type=float, default=2e-5,  help="Learning rate")
    p.add_argument("--bsz",       type=int,   default=2,     help="Batch size per device")
    p.add_argument("--grad_acc",  type=int,   default=1,     help="Gradient accumulation steps")  # ✅ 추가됨
    p.add_argument("--max_len",   type=int,   default=1024,  help="Max sequence length")
    p.add_argument("--source", default="beomi", choices=["beomi", "custom", "jojo"], help="Data source")
    p.add_argument("--train",     default=None, help="Path to custom train.json")  
    p.add_argument("--val",       default=None, help="Path to custom val.json")
    p.add_argument("--dataset", default="beomi/KoAlpaca-RealQA", help="HF dataset name when source=beomi")
    p.add_argument("--resume", action="store_true", help="Resume from last checkpoint if available")
    p.add_argument("--load_in_4bit", action="store_true", help="Enable 4bit quantization")
    return p.parse_args()

# ───────────────────────── MAIN ─────────────────────────────
def main():
    args = parse_args()
    
    os.makedirs(args.out, exist_ok=True)

    print("현재 데이터 셋:", args.dataset)

    # ✅ source 값에 따라 dataset 자동 설정
    if args.source == "jojo":
        args.dataset = "jojo0217/korean_safe_conversation"

    os.makedirs(args.out, exist_ok=True)

    # ✅ 데이터 로딩
    if args.source == "custom":
        if not args.train or not args.val:
            raise ValueError("커스텀 학습 시 --train, --val 경로가 필요합니다.")
        print(f"📥 커스텀 데이터셋 로딩 중... (train: {args.train}, val: {args.val})")
        data_files = {"train": args.train, "validation": args.val}
        ds_raw = load_dataset("json", data_files=data_files)
    else:
        print(f"📥 데이터셋 로딩 중: {args.dataset}")
        ds_raw = load_dataset(args.dataset)
        ds_raw = ds_raw["train"].train_test_split(test_size=0.05, seed=42)

    # ✅ ChatML 변환 함수
    if args.source == "jojo":
        def to_chatml(ex):
            return {
                "text": f"<|user|>\n{ex['instruction'].strip()}</s>\n<|assistant|>\n{ex['output'].strip()}</s>"
            }
    else:  # 기본 beomi 또는 기타
        def to_chatml(ex):
            return {
                "text": f"<|user|>\n{ex.get('question', ex.get('input', '')).strip()}</s>\n<|assistant|>\n{ex.get('answer', ex.get('output', '')).strip()}</s>"
            }

    ds_train = ds_raw["train"].map(to_chatml, remove_columns=ds_raw["train"].column_names)
    ds_eval  = ds_raw["validation" if "validation" in ds_raw else "test"].map(to_chatml, remove_columns=ds_raw["train"].column_names)

    # ✅ 모델 로드
    print(f"🚀 베이스 모델 로드: {args.base}")
    tok = AutoTokenizer.from_pretrained(args.base, use_fast=False)
    tok.pad_token = tok.eos_token

    # ✅ 4bit 로딩 옵션 처리
    if args.load_in_4bit:
        print("🔧 4bit 양자화 로딩 활성화됨")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.bfloat16,  # 또는 torch.float16
            bnb_4bit_quant_type="nf4"
        )

        model = AutoModelForCausalLM.from_pretrained(
            args.base,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True
        )
    else:
        model = AutoModelForCausalLM.from_pretrained(
            args.base,
            torch_dtype=torch.float32,
            device_map="auto",
            trust_remote_code=True
        )

    model.gradient_checkpointing_enable()
    model.config.use_cache = False

    # ✅ 트레이너 설정
    train_args = TrainingArguments(
        output_dir=args.out,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.bsz,
        per_device_eval_batch_size=args.bsz,
        learning_rate=args.lr,
        gradient_accumulation_steps=args.grad_acc,
        fp16=not args.load_in_4bit,
        logging_steps=20,
        save_total_limit=3,
        eval_steps=500,
        optim="paged_adamw_8bit",
        overwrite_output_dir=True
    )

    trainer = SFTTrainer(
        model=model,
        train_dataset=ds_train,
        eval_dataset=ds_eval,
        tokenizer=tok,
        dataset_text_field="text",
        #data_collator=DataCollatorForLanguageModeling(tok, mlm=False),
        data_collator=None,
        max_seq_length=args.max_len,
        packing=False,
        args=train_args
    )

    # ✅ resume 옵션이 True일 경우, rng_state.pth 제거
    if args.resume:
        from glob import glob
        import shutil

        ckpts = sorted(glob(os.path.join(args.out, "checkpoint-*")), reverse=True)
        if ckpts:
            latest_ckpt = ckpts[0]
            rng_file = os.path.join(latest_ckpt, "rng_state.pth")
            if os.path.exists(rng_file):
                print(f"🧹 Removing RNG state file: {rng_file}")
                os.remove(rng_file)

    # ✅ 학습 실행
    trainer.train(resume_from_checkpoint=args.resume)

    # for epoch in range(1, args.epochs + 1):
    #     trainer.train(resume_from_checkpoint=args.resume)
    #     eval_result = trainer.evaluate()
    #     loss = eval_result.get("eval_loss", None)
    #     print(f"[SFT] epoch {epoch}/{args.epochs} loss={loss:.4f}", flush=True)

    trainer.save_model(args.out)
    tok.save_pretrained(args.out)
    print(f"✅ Base 모델 저장 완료: {args.out}")

if __name__ == "__main__":
    main()
