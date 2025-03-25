# 🍸 Flapper Moonshine - Backend

이 프로젝트는 1920~30년대 금주법 시대를 배경으로 한 칵테일 바 운영 게임인 **Flapper Moonshine**의 백엔드 시스템입니다.  
사용자와 NPC 간의 AI 대화를 기반으로 칵테일 제조, 평판 점수, 챗봇 학습 등을 포함한 기능을 제공합니다.

---

## 📁 디렉토리 구조

```
flapper-backend/
├── admin-server/         # 관리자 웹 서버 (Express.js + React)
├── ai-trainer-server/    # AI 챗봇 학습 서버 (Python + FastAPI)
├── ai-service-server/    # AI 챗봇 응답/서비스 서버
├── data/                 # 데이터셋, SQL, 전처리된 CSV 등
├── notebooks/            # 데이터 분석 및 전처리 Jupyter Notebook
└── README.md             # 이 문서
```

---

## 🧠 시스템 구성 요약

| 구성 요소 | 역할 |
|-----------|------|
| **Admin Server** | 관리자 전용 웹 UI 및 백오피스 API 제공 |
| **AI Trainer Server** | NPC 챗봇 학습 처리, 버전 관리 |
| **AI Service Server** | 사용자와의 대화 처리, 유저별 AI 응답 제공 |
| **Data/Notebooks** | 칵테일, NPC, 대화 데이터 전처리 및 분석 |

---

## 🛠 기술 스택

### 공통
- MariaDB (데이터베이스)
- JWT (토큰 기반 인증)
- RESTful API

### 서버별 스택
| 서버 | 언어 | 프레임워크 |
|------|------|------------|
| `admin-server` | JavaScript | Node.js, Express, (React for frontend) |
| `ai-trainer-server` | Python | FastAPI, PyTorch |
| `ai-service-server` | Python or Node.js | FastAPI or Express |

---

## 🧪 로컬 개발 환경 실행

```bash
# 1. 관리자 서버 실행
cd admin-server
npm install
node server.js

# 2. AI 학습 서버 실행
cd ai-trainer-server
python main.py

# 3. AI 서비스 서버 실행
cd ai-service-server
node server.js  # 또는 python main.py
```

---

## 🗃 데이터 디렉토리

```
data/
├── raw/          # 원본 데이터셋 (CSV, JSON 등)
├── processed/    # 전처리된 CSV
├── sql/          # SQL INSERT 파일
└── README.md     # 데이터 설명 문서
```

모든 데이터 전처리는 `notebooks/` 디렉토리 내 Jupyter Notebook을 통해 진행됩니다.

---

## 👤 관리자 계정

- 초기 관리자 계정은 `Flapper_Moonshine.sql`에 포함되어 있습니다.
- 비밀번호는 해시 처리되어 저장되며, 관리자 페이지에서 로그인 가능합니다.

---

## 📦 향후 확장 예정

- 유저별 AI 학습 자동화
- 대화 기록 기반 추천 시스템
- 챗봇 버전 롤백 및 비교 기능

---

## 🙋‍♂️ 개발자 정보

- **백엔드 설계 및 구현**: 최재인
- **DB 설계 및 데이터셋 정제**: 최재인
- **AI 챗봇 학습 구조 기획**: 최재인

---

## 📄 라이선스

본 프로젝트는 개인 및 학술 연구 목적으로만 사용되며, 상업적 사용은 금지됩니다.