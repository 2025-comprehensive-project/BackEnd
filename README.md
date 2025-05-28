# 🍸 Flapper Moonshine - Backend & AI

**Flapper Moonshine**은 1930년대 금주법 이후의 가상 도시에서  
칵테일 바를 운영하며 다양한 NPC와 AI 기반 대화를 나누는  
**서사 중심 시뮬레이션 게임**입니다.

이 레포지토리는 게임의 **백엔드 API 서버 및 AI 학습/응답 시스템**을 포함합니다.

---

## 📁 프로젝트 구조

```

PROJECT\_FM/
├── src/
│   ├── ai/                      # AI 챗봇 및 예측 모델
│   │   ├── chatbot/             # Flask 응답 서버 및 LoRA 로딩
│   │   └── cocktail\_predictor/  # 맛/풍미 예측 모델
│   │
│   └── web/                     # 전체 웹 서비스
│       ├── backend/            # Node.js 기반 REST API 서버
│       ├── frontend/           # React 기반 관리자 웹 클라이언트
│       ├── db/                 # MariaDB SQL 스키마/시드
│       └── logs/               # 백엔드 로그 기록
│
├── notebooks/                  # Jupyter 기반 실험/분석
├── .env                        # 환경 변수
├── venv/                       # Python 가상환경
├── .gitignore
├── package.json
└── README.md

````

---

## 🚀 실행 방법

### 1. 환경 변수 설정 (`.env`)

```
# 서버 포트
PORT=60003

# 데이터베이스 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=flapper2025
DB_NAME=Flapper_Moonshine

# 인증 및 외부 서비스
JWT_SECRET=flapper_secret
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_pw
BASE_RESET_URL=http://localhost:3000/reset-password

# 데모 모드 설정 (AI 서버 실행 여부 결정)
DEMO_MODE=True
```

---

### 2. 전체 서버 실행 (루트 디렉토리 기준)

```
npm install
npm run start
```

* 루트 디렉토리(`PROJECT_FM/`)에서 명령어 한 번으로 전체 백엔드 서버를 실행합니다.
* `src/web/backend/server.js`를 통해 Node.js API 서버가 실행되며,
* 내부적으로 **Flask AI 서버 실행 여부는 `.env`의 `DEMO_MODE` 값에 따라 결정됩니다.**

---

### ✅ DEMO\_MODE 동작 방식

| DEMO\_MODE 값 | 동작                                                |
| ------------ | ------------------------------------------------- |
| `False`      | `src/ai/chatbot/llama_server.py` 자동 실행 (AI 응답 가능) |
| `True`       | Flask 서버 미실행 (기본값, 모델 미포함 배포 대응용)                 |

> Git에는 AI 모델 파일이 포함되어 있지 않기 때문에 기본적으로 `DEMO_MODE=True`로 유지되어야 합니다.

---

## 🧠 주요 구성 요소

| 모듈                    | 설명                         |
| --------------------- | -------------------------- |
| `backend/`            | 관리자/유저 API, 학습 트리거 및 로그 수집 |
| `frontend/`           | 관리자용 React 클라이언트           |
| `chatbot/`            | Flask 기반 TinyLlama 응답 서버   |
| `cocktail_predictor/` | 랜덤 포레스트 기반 맛 예측기           |
| `db/`                 | 초기 테이블 및 삽입 SQL            |
| `logs/`               | 백엔드 학습/운영 로그 기록            |
| `notebooks/`          | 데이터 분석 및 전처리 실험            |

---

## ✨ 기능 요약

* 관리자 로그인, 유저 관리
* 칵테일 재료 및 가니시 메타데이터 관리
* 기본 및 커스텀 레시피 저장 및 추천
* NPC AI 응답 서버 연동
* 유저별 대화 저장 및 학습 트리거
* Flask 모델 핫스왑, 버전 관리
* BERTScore/BLEU 기반 응답 평가 시스템 포함

---

## 🧠 AI 시스템 흐름도

```
[유저 ↔ NPC 대화]
        ↓
[대화 로그 저장 + 세이브]
        ↓
[학습 트리거 → LoRA 학습 (chatbot/)]
        ↓
[Flask 응답 서버 → LoRA 어댑터 로딩]
        ↓
[실시간 AI 응답 + 버전 캐싱]
```

---

## 📊 사용 기술 스택

* **Node.js + Express**
* **React + Axios**
* **MariaDB + Sequelize**
* **Redis**
* **Flask + PyTorch**
* **Transformers + PEFT**
* **Nodemailer / Bcrypt / JWT / OAuth(Google)**

---

## 👤 개발자

* **백엔드 & AI 설계/개발**: 최재인 (Choi Jae-in)
* **지도교수**: 이병문 교수님 / PLA.I 3팀 (2025 종합설계)

---

## 📄 라이선스

본 프로젝트는 졸업 작품 및 비상업적 학습 목적으로 사용됩니다.
2차 배포 및 상업적 이용은 금지됩니다.