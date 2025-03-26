# 🍸 Flapper Moonshine - Backend

**Flapper Moonshine**은 1930년대 금주법 이후 시대의 가상 도시를 배경으로  
칵테일 바를 운영하며 다양한 NPC와 AI 기반 대화를 나누는 **서사형 시뮬레이션 게임**입니다.

본 레포지토리는 게임의 백엔드 서버로, **유저 관리, 관리자 기능, AI 챗봇 응답 및 학습 자동화**까지 포함됩니다.

---

## 📁 디렉토리 구조

```
flapper-backend/
├── flapper/                 # 사용자 서비스 및 관리자 API (Node.js)
│   ├── db/                  # SQL 및 초기 데이터베이스 파일
│   └── src/
│       ├── auth/            # OAuth, 인증 관련 컨트롤러
│       ├── config/          # DB 연결 등 환경설정
│       ├── controllers/     # 라우팅 로직 처리
│       │   ├── admin/       # 관리자 전용 컨트롤러
│       │   └── user/        # 유저 전용 컨트롤러
│       ├── middlewares/     # 인증, 검증 미들웨어
│       ├── models/          # DB 모델 (필요 시 사용)
│       ├── routes/          # 라우팅 설정
│       │   ├── admin/       # 관리자 API 라우터
│       │   └── user/        # 유저 API 라우터
│       ├── services/        # 비즈니스 로직 처리 계층
│       ├── utils/           # JWT, 로깅, OAuth 설정 등 유틸
│       ├── app.js           # Express 앱 설정
│       └── server.js        # 서버 실행 진입점
│
├── neo-ai/                  # AI 챗봇 모델 및 학습 서버
│   ├── ai-service/          # Flask 기반 TinyLlama 응답 서버
│   └── ai-trainer/          # 전이학습 / 파인튜닝 자동화 서버
│
├── data/                    # 학습용 데이터셋 및 SQL
├── notebooks/               # 데이터 분석 / 전처리용 Jupyter 노트북
└── README.md                # 본 문서
```

---

## 🧠 시스템 구성

| 구성 요소 | 역할 |
|-----------|------|
| **flapper/** | Node.js 기반의 메인 백엔드 서버. 유저 관리, 로그인, NPC 요청 전달 등 |
| **neo-ai/ai-service** | TinyLlama 챗봇 응답 생성 서버 (Flask 기반) |
| **neo-ai/ai-trainer** | 학습 자동화 및 챗봇 파인튜닝 서버 |
| **data/** | SQL 및 학습용 대화 데이터 |
| **notebooks/** | 데이터 전처리 및 시각화, 분석 |

---

## 🛠 기술 스택

- **Node.js + Express**: API 서버 (유저/관리자)
- **Python + Flask**: 챗봇 응답 서버
- **FastAPI (예정)**: 챗봇 학습 트리거 및 스케줄링
- **MariaDB**: 유저, 레시피, 대화 로그 저장소
- **Redis**: 유저별 세션 저장소 (AI 대화 컨텍스트)
- **PyTorch + HuggingFace Transformers**: 챗봇 모델 학습
- **JWT**: 인증 및 권한 관리
- **Google OAuth**: 유저 로그인 인증

---

## 🚀 실행 방법

### 1. 환경 변수 설정

`.env` 파일을 `flapper/` 디렉토리에 생성:

```env
DB_HOST=localhost
DB_USER=flapper
DB_PASSWORD=your_password
DB_NAME=Flapper_Moonshine

GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
```

---

### 2. 개발 서버 실행

```bash
# flapper 백엔드 서버 실행
cd flapper
npm install
npm run dev  # nodemon 사용 시

# AI 챗봇 응답 서버 실행
cd ../neo-ai/ai-service
python tinyllama_server.py

# AI 트레이너 서버 실행
cd ../ai-trainer
python train_launcher.py
```

---

## 🗃 데이터 구조 요약

- `user`: 유저 기본 정보 및 게임 진행 상태
- `cocktail_recipe`: 칵테일 레시피 및 맛/향 점수
- `dialog_log`: 유저-NPC 간 대화 로그
- `training_sessions`: 학습 큐 관리 테이블

---

## 🔄 학습 파이프라인

```text
[대화 로그 DB]
   ↓
[admin에서 학습 요청]
   ↓
[ai-trainer가 감지 → 학습용 jsonl 추출 → 학습 진행]
   ↓
[최신 모델 → ai-service에 배포]
```

---

## ✨ 향후 확장

- NPC 개별 챗봇 → 유저별 전이학습
- 관리자 UI에서 대화 로그 조회 및 학습 트리거
- 챗봇 성능 평가 기능 도입 (BLEU, perplexity 등)
- Docker 컨테이너화 및 AWS 배포

---

## 👤 개발자 정보

- **Backend 설계 및 구현**: 최재인
- **AI 챗봇 아키텍처 및 학습 설계**: 최재인
- **DB 및 칵테일 맛/향 점수 설계**: 최재인

---

## 📚 Dataset Overview

본 프로젝트에서 사용된 AI 학습용 대화 데이터셋은 다음과 같습니다:

### 1. **KoAlpaca v1.1**
- **설명**: 한국어로 instruction-tuning이 가능한 Alpaca 스타일 대화 데이터셋입니다.
- **형식**: `{ "instruction": ..., "input": ..., "output": ... }`
- **출처**: [beomi/KoAlpaca](https://github.com/beomi/KoAlpaca)  
- **라이선스**: CC BY-NC 4.0 (비상업적 사용에 한해 자유롭게 이용 가능)

### 2. **Kakao 대화 데이터셋**
- **설명**: 한국어 일상 대화 형식의 커스텀 데이터셋으로, 유저와 시스템 간 대화를 LoRA 학습 포맷에 맞게 재구성하였습니다.
- **형식**: `{ "messages": [ { "role": "user", "content": ... }, { "role": "assistant", "content": ... } ] }`
- **출처**: [Ludobico/KakaoChatData](https://github.com/Ludobico/KakaoChatData/tree/main)

---

## 🔁 전처리 방식
- KoAlpaca는 `instruction + output`을 기반으로 `messages` 형식으로 변환
- Kakao 데이터는 기존 형식에서 LoRA 학습용 JSONL로 재구성
- 데이터 병합 후 학습용/검증용 세트로 무작위 분할 (`train.jsonl`, `valid.jsonl`)

---

## 📄 라이선스

본 프로젝트는 개인 연구 및 학습용으로만 사용됩니다.  
상업적 이용은 허가되지 않으며, 추후 별도 라이선스를 명시할 예정입니다.