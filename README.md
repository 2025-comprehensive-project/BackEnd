좋아, 최신 프로젝트 구조와 컨벤션에 맞춰 README를 리팩토링할게. 아래는 수정된 버전이야. 내용 검토 후 수정하거나 추가하고 싶은 부분 알려줘.

---

# 🍸 Flapper Moonshine - Backend

**Flapper Moonshine**은 1930년대 금주법 이후의 가상 도시에서  
칵테일 바를 운영하며 다양한 NPC와 AI 기반 대화를 나누는  
**서사 중심 시뮬레이션 게임**입니다.

이 레포지토리는 게임의 **백엔드 서버**로,  
유저 관리 / 관리자 기능 / 칵테일 시스템 / AI 챗봇 응답 및 학습 자동화까지 포함합니다.

---

## 📁 프로젝트 구조

```
back/
├── data/                            # 학습용 데이터셋, SQL 파일 등
│
├── notebooks/                       # 분석 및 전처리용 Jupyter 노트북
│
├── src/                             # Node.js 기반 백엔드 서버
│   ├── ai/                          # AI 연동 기능
│   │   └── chatbotProxy.js          # Flask 챗봇 응답 서버 프록시 호출
│
│   ├── api/                         # REST API 라우터 및 컨트롤러
│   │   ├── admin/                   # 관리자 API
│   │   │   ├── controllers/
│   │   │   │   ├── aiController.js
│   │   │   │   ├── cocktailController.js
│   │   │   │   ├── loginController.js
│   │   │   │   ├── metaController.js
│   │   │   │   └── userController.js
│   │   │   └── routes/
│   │   │       ├── aiRoutes.js
│   │   │       ├── cocktailRoutes.js
│   │   │       ├── metaRoutes.js
│   │   │       └── userRoutes.js
│   │   │
│   │   └── user/                    # 유저 API
│   │       ├── controllers/
│   │       │   ├── ingredientController.js
│   │       │   ├── npcController.js
│   │       │   ├── profileController.js
│   │       │   └── saveController.js
│   │       └── routes/
│   │           ├── ingredientRoutes.js
│   │           ├── npcRoutes.js
│   │           ├── profileRoutes.js
│   │           └── saveRoutes.js
│
│   ├── config/                      # 환경 설정
│   │   ├── dbConnect.js             # MariaDB 연결
│   │   └── redisClient.js           # Redis 연결
│
│   ├── db/                          # SQL 및 시드 파일
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── insert_cocktail_recipe.sql
│   │   └── 기타 삽입용 SQL 파일들
│
│   ├── middleware/                 # 공통 미들웨어
│   │   ├── adminAuth.js            # 관리자 JWT 인증
│   │   ├── errorHandler.js         # 에러 핸들러
│   │   └── googleAuth.js           # Google OAuth 관련
│
│   ├── services/                   # 서비스 레이어
│   │   ├── chatService.js
│   │   └── trainerService.js
│
│   ├── utils/                      # 유틸 함수
│   │   ├── adminSeeder.js
│   │   ├── errorCreator.js
│   │   └── logger.js
│
│   ├── app.js                      # Express 앱 초기화
│   └── server.js                   # 서버 실행 진입점
│
├── .env                            # 환경 변수 설정 파일
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

```

---

## 🧠 시스템 구성

| 구성 요소 | 설명 |
|----------|------|
| `flapper/` | 메인 백엔드 서버, 관리자 API 및 유저 API 제공 |
| `neo-ai/ai-service` | NPC 챗봇 응답 처리 서버 (TinyLlama 기반) |
| `neo-ai/ai-trainer` | 대화 로그 기반 LoRA 학습 및 모델 배포 |
| `data/` | JSONL 데이터 및 SQL 초기 데이터 |
| `notebooks/` | 데이터 전처리 및 성능 분석 |

---

## 🛠 기술 스택

- **Node.js + Express**: REST API 서버
- **MariaDB**: 게임 및 유저 정보 저장
- **Redis**: 세션 / 대화 컨텍스트 캐싱
- **Flask**: AI 응답 서버
- **PyTorch + Transformers**: TinyLlama 기반 챗봇 학습
- **JWT + OAuth (Google)**: 유저 인증
- **Bcrypt**: 비밀번호 해싱
- **Winston**: 커스텀 로거 (에러/이벤트 기록)
- **Nodemailer**: 비밀번호 재설정 메일 발송

---

## 🚀 실행 방법

### 1. 환경변수 설정

`.env` 예시 (flapper/src/.env):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
DB_NAME=Flapper_Moonshine

JWT_SECRET=flapper_secret
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_pw

BASE_RESET_URL=http://localhost:3000/reset-password
```

---

### 2. 서버 실행

```bash
# 1. 백엔드 서버 실행
cd flapper
npm install
npm run dev

# 2. 챗봇 응답 서버 실행 (Flask)
cd ../neo-ai/ai-service
python tinyllama_server.py

# 3. 챗봇 학습 서버 실행
cd ../ai-trainer
python train_launcher.py
```

---

## 📦 주요 기능

- 관리자 로그인, 계정 관리
- 유저 정보 및 세이브 슬롯 관리
- 기본 / 커스텀 칵테일 레시피 저장 및 편집
- 재료 및 가니시 메타데이터 관리
- AI NPC와의 대화 및 대화 로그 수집
- AI 학습 요청 / 버전 제어 / 자동 재배포

---

## 🔄 AI 학습 흐름도

```text
[유저 대화 로그 DB]
        ↓
[관리자 요청 or 자동 조건 감지]
        ↓
[neo-ai/ai-trainer]
  ↳ 세션 전처리 → LoRA 학습 → 저장
        ↓
[neo-ai/ai-service]
  ↳ 모델 버전 업데이트 → 실시간 응답
```

---

## 📚 데이터셋

- **KoAlpaca v1.1**: Alpaca 스타일 instruction tuning (CC BY-NC 4.0)
- **KakaoChatData**: 한국어 대화 로그 기반 데이터
- **Custom NPC 대화 로그**: 게임 내 유저 대화 저장 → 학습용 JSONL 변환

---

## ✨ 향후 확장

- NPC별 Fine-tuning + 유저별 LoRA adapter 분기
- 관리자 UI → 대화 수정 및 수동 학습
- 성능 평가 지표 도입 (BLEU, BERTScore)
- AWS EC2 / S3 배포, Docker 기반 인프라 전환

---

## 👤 개발 정보

- **백엔드 / AI 서버 / 데이터베이스 설계 및 구현**: **최재인 (Choi Jae-in)**

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