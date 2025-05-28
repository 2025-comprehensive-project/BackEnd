import os
import sys
import json
import requests
import argparse
from bert_score import score as bertscore
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction

BASE_DIR = os.path.dirname(__file__)
DEFAULT_DATASET = os.path.join(BASE_DIR, "../data/eval/base/default_testset.jsonl")

# ---------------------- 평가 요청 ----------------------
def generate_response_flask(prompt: str, model_type: str, npc_id=None, user_id=None, slot_id=None) -> str:
    url = "http://localhost:50003/generate"
    if model_type == "base":
        url += "/base"
        payload = {"prompt": prompt}
    elif model_type == "lora":
        url += f"/{npc_id}"
        payload = {"prompt": prompt}
    elif model_type == "rola":
        url += f"/{npc_id}"
        payload = {"prompt": prompt, "user_id": user_id, "slot_id": slot_id}
    else:
        raise ValueError(f"❌ 지원하지 않는 model_type: {model_type}")

    res = requests.post(url, json=payload)
    if res.status_code != 200:
        raise RuntimeError(f"❌ 요청 실패: {res.status_code}, {res.text}")
    return res.json()["response"]

# ---------------------- 평가 지표 ----------------------
def evaluate_scores(predictions, references):
    P, R, F1 = bertscore(predictions, references, lang="ko")
    smooth = SmoothingFunction().method1
    bleu_scores = []
    for pred, ref in zip(predictions, references):
        pred_tokens = pred.strip().split()
        ref_tokens = ref.strip().split()

        if not pred_tokens or not ref_tokens:
            bleu_scores.append(0.0)
            continue

        score = sentence_bleu(
            [ref_tokens],
            pred_tokens,
            weights=(1.0, 0, 0, 0),  # 1-gram only
            smoothing_function=SmoothingFunction().method4
        )
        bleu_scores.append(score)
    return {
        "bert_score": round(F1.mean().item(), 4),
        "bleu_score": round(sum(bleu_scores) / len(bleu_scores), 4)
    }

# ---------------------- 평가 실행 ----------------------
def run_evaluation(dataset_path: str, model_type: str, npc_id=None, user_id=None, slot_id=None):
    # 절대경로로 변환
    if not os.path.isabs(dataset_path):
        abs_path = os.path.abspath(os.path.join(BASE_DIR, "..", dataset_path))
    else:
        abs_path = dataset_path
    print(f"[DEBUG] Opening dataset file at: {abs_path}", file=sys.stderr)

    with open(abs_path, "r", encoding="utf-8") as f:
        data = [json.loads(line) for line in f]

    predictions = []
    references = []

    for i, item in enumerate(data):
        prompt = item["input"]
        ground_truth = item["ground_truth"]

        try:
            response = generate_response_flask(prompt, model_type, npc_id, user_id, slot_id)
            predictions.append(response.strip())
            references.append(ground_truth.strip())
            print(f"[{i+1}/{len(data)}] ✅ {prompt} → {response}", file=sys.stderr)
        except Exception as e:
            print(f"[{i+1}/{len(data)}] ❌ 에러: {e}", file=sys.stderr)
            predictions.append("")
            references.append(ground_truth.strip())

    return evaluate_scores(predictions, references)

# ---------------------- Entry ----------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=str, default=DEFAULT_DATASET, help="평가용 데이터셋 경로 (.jsonl)")
    parser.add_argument("--model_type", type=str, required=True, choices=["base", "lora", "rola"], help="모델 유형")
    parser.add_argument("--npc_id", type=str, help="NPC ID (lora/rola용)")
    parser.add_argument("--user_id", type=int, help="유저 ID (rola용)")
    parser.add_argument("--slot_id", type=int, help="슬롯 ID (rola용)")
    args = parser.parse_args()

    result = run_evaluation(
        dataset_path=args.dataset,
        model_type=args.model_type,
        npc_id=args.npc_id,
        user_id=args.user_id,
        slot_id=args.slot_id
    )
    sys.stdout.write(json.dumps(result, ensure_ascii=False))
