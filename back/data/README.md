# 📁 data 디렉토리

이 디렉토리는 Flapper Moonshine 프로젝트에서 사용되는 데이터셋을 저장하고 관리하기 위한 공간입니다.  
데이터 전처리, 분석, SQL 변환 등과 관련된 파일들이 포함되어 있습니다.

---

## 📂 디렉토리 구조

```
data/
├── raw/ # 원본 데이터 (수집한 csv, json 등)  
├── processed/ # 전처리된 데이터 (모델 학습, DB 입력용 등) 
|── sql/ # SQL 변환된 데이터 (INSERT 쿼리 등) 
└── README.md # 이 파일
```

---

## 📄 파일 설명

### 🔹 `raw/`

- 원본 수집 데이터 파일을 보관합니다.
- 직접 수정하지 않고 읽기 전용으로 사용하세요.
- 예: `cocktails_raw.csv`, `npc_dialogues_original.json`

### 🔹 `processed/`

- 전처리된 데이터셋이 저장됩니다.
- 학습, DB 입력, 분석 목적 등으로 재사용됩니다.
- 예: `cocktails_cleaned.csv`, `npc_training_input.csv`

### 🔹 `sql/`

- 데이터셋을 SQL INSERT 문으로 변환한 파일들이 저장됩니다.
- DB 초기화 시 `admin-server/db/`에 복사해서 사용 가능

---

## 🧼 전처리/분석 노트북 위치

데이터를 가공하거나 분석한 Jupyter Notebook은  
프로젝트 루트의 [`/notebooks`](../notebooks) 디렉토리에 저장됩니다.

---

## 📌 주의사항

- `raw/` 디렉토리의 데이터는 직접 수정하지 마세요.  
  수정이 필요한 경우, 별도의 처리 과정을 거쳐 `processed/`로 저장하세요.
- Git에 포함되지 말아야 할 민감한 데이터는 `.gitignore`에 등록하세요.
- 모든 전처리 작업은 버전 관리된 Jupyter Notebook으로 기록하는 것이 좋습니다.

---

## 👩‍💻 관리 주체

- 데이터 정리/분석: `최재인`
- 칵테일 DB 설계 및 SQL 생성: `최재인`


