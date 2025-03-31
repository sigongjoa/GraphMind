# 개념 그래프 학습 시스템 명세서

## 1. 프로젝트 개요

개념 그래프 학습 시스템은 사용자가 자기 주도적으로 학습할 수 있도록 도와주는 웹 애플리케이션입니다. 이 시스템은 개념들을 그래프 형태로 시각화하고, LLM(대규모 언어 모델)과의 상호작용을 통해 학습을 지원하며, 간격 반복(Spaced Repetition) 기법을 활용한 복습 기능을 제공합니다.

## 2. 시스템 아키텍처

### 2.1 프론트엔드
- **프레임워크**: Next.js (React 기반)
- **상태 관리**: React Hooks
- **UI 라이브러리**: Tailwind CSS
- **그래프 시각화**: react-force-graph

### 2.2 백엔드
- **프레임워크**: FastAPI (Python)
- **데이터베이스**: SQLite
- **ORM**: SQLAlchemy

### 2.3 LLM 통합
- 로컬 LLM 목업 구현 (실제 구현 시 LM Studio 등과 연동)

## 3. 주요 기능

### 3.1 개념 그래프
- 개념 노드와 연결 시각화
- 개념 간 관계 탐색
- 개념 추가, 수정, 삭제

### 3.2 학습 모드
- LLM과의 대화형 학습
- 개념 설명 요청
- 문제 생성 및 풀이
- 관련 개념 추천

### 3.3 복습 모드
- 간격 반복 알고리즘(SM-2) 기반 복습 일정
- 난이도 평가 및 다음 복습 일정 조정
- 복습 진행 상황 추적

### 3.4 노트 관리
- 마크다운 기반 노트 작성
- 개념별 노트 관리
- 노트 편집 및 삭제

## 4. 데이터베이스 스키마

### 4.1 개념(Concept)
- id: 기본 키
- name: 개념 이름
- description: 개념 설명
- created_at: 생성 시간
- updated_at: 수정 시간

### 4.2 연결(Connection)
- id: 기본 키
- source_id: 출발 개념 ID (외래 키)
- target_id: 도착 개념 ID (외래 키)
- relation: 관계 유형
- strength: 연결 강도
- created_at: 생성 시간

### 4.3 카드(Card)
- id: 기본 키
- concept_id: 개념 ID (외래 키)
- question: 질문
- answer: 답변
- explanation: 설명
- created_at: 생성 시간
- updated_at: 수정 시간

### 4.4 복습(Review)
- id: 기본 키
- card_id: 카드 ID (외래 키)
- difficulty: 난이도 평가 (1-5)
- next_review_date: 다음 복습 일정
- created_at: 생성 시간

### 4.5 노트(Note)
- id: 기본 키
- concept_id: 개념 ID (외래 키)
- title: 제목
- content: 내용
- created_at: 생성 시간
- updated_at: 수정 시간

### 4.6 학습 이력(LearningHistory)
- id: 기본 키
- concept_id: 개념 ID (외래 키)
- activity_type: 활동 유형 ("learning", "review", "note")
- created_at: 생성 시간

## 5. API 엔드포인트

### 5.1 개념 API
- GET /concepts/: 모든 개념 조회
- GET /concepts/{concept_id}: 특정 개념 조회
- POST /concepts/: 개념 생성
- PUT /concepts/{concept_id}: 개념 수정
- DELETE /concepts/{concept_id}: 개념 삭제

### 5.2 연결 API
- GET /connections/: 모든 연결 조회
- POST /connections/: 연결 생성
- DELETE /connections/{connection_id}: 연결 삭제

### 5.3 카드 API
- GET /cards/: 모든 카드 조회
- GET /cards/?concept_id={concept_id}: 특정 개념의 카드 조회
- GET /cards/{card_id}: 특정 카드 조회
- POST /cards/: 카드 생성
- PUT /cards/{card_id}: 카드 수정
- DELETE /cards/{card_id}: 카드 삭제

### 5.4 복습 API
- GET /reviews/: 모든 복습 기록 조회
- GET /reviews/?card_id={card_id}: 특정 카드의 복습 기록 조회
- POST /reviews/: 복습 기록 생성

### 5.5 노트 API
- GET /notes/: 모든 노트 조회
- GET /notes/?concept_id={concept_id}: 특정 개념의 노트 조회
- GET /notes/{note_id}: 특정 노트 조회
- POST /notes/: 노트 생성
- PUT /notes/{note_id}: 노트 수정
- DELETE /notes/{note_id}: 노트 삭제

### 5.6 LLM 통합 API
- POST /llm/explain: 개념 설명 요청
- POST /llm/generate-question: 문제 생성 요청
- POST /llm/suggest-concepts: 관련 개념 추천 요청

## 6. 파일 구조 및 역할

### 6.1 백엔드 파일 구조

#### app.py
- FastAPI 애플리케이션 설정 및 API 엔드포인트 정의
- CORS 설정 및 의존성 주입 설정
- 모든 API 라우트 구현

#### models.py
- SQLAlchemy ORM 모델 정의
- 데이터베이스 테이블 구조 정의
- 모델 간 관계 설정

#### schemas.py
- Pydantic 스키마 정의
- 요청 및 응답 데이터 유효성 검사
- API 문서화를 위한 스키마 정의

#### crud.py
- 데이터베이스 CRUD 작업 함수 구현
- 각 모델에 대한 생성, 조회, 수정, 삭제 함수
- 복잡한 쿼리 및 비즈니스 로직 구현

#### database.py
- 데이터베이스 연결 설정
- SQLAlchemy 엔진 및 세션 설정
- 기본 모델 클래스 정의

### 6.2 프론트엔드 파일 구조

#### 공통 컴포넌트 (components/common/)

##### Header.tsx
- 상단 헤더 컴포넌트
- 네비게이션 및 검색 기능 제공

##### SearchBar.tsx
- 검색 입력 컴포넌트
- 개념 검색 기능 제공

##### Button.tsx
- 재사용 가능한 버튼 컴포넌트
- 다양한 스타일 및 크기 지원

##### Card.tsx
- 카드 형태의 컨테이너 컴포넌트
- 제목, 내용, 푸터 영역 지원

##### Modal.tsx
- 모달 다이얼로그 컴포넌트
- 팝업 형태의 UI 제공

##### Loader.tsx
- 로딩 상태 표시 컴포넌트
- 다양한 크기 및 색상 지원

##### ErrorBoundary.tsx
- 에러 처리 컴포넌트
- 에러 발생 시 폴백 UI 제공

#### 대시보드 컴포넌트 (components/dashboard/)

##### Dashboard.tsx
- 메인 대시보드 페이지 컴포넌트
- 학습 진행 상황, 복습 일정, 최근 개념 표시

##### LearningProgress.tsx
- 학습 진행 상황 표시 컴포넌트
- 진행률 및 통계 정보 제공

##### ReviewSchedule.tsx
- 복습 일정 표시 컴포넌트
- 오늘의 복습 카드 목록 제공

##### RecentConcepts.tsx
- 최근 학습한 개념 표시 컴포넌트
- 개념 카드 목록 제공

#### 개념 그래프 컴포넌트 (components/graph/)

##### ConceptGraph.tsx
- 개념 그래프 페이지 컴포넌트
- 그래프 시각화 및 필터링 기능 제공

##### GraphVisualization.tsx
- 그래프 시각화 컴포넌트
- react-force-graph를 활용한 그래프 렌더링

#### 개념 상세 컴포넌트 (components/concept/)

##### ConceptDetail.tsx
- 개념 상세 페이지 컴포넌트
- 개념 정보, 관련 개념, 학습 카드, 노트 표시

#### 학습 모드 컴포넌트 (components/learning/)

##### LearningMode.tsx
- 학습 모드 페이지 컴포넌트
- LLM과의 대화형 학습 인터페이스 제공

##### LLMInteraction.tsx
- LLM 대화 인터페이스 컴포넌트
- 메시지 표시 및 입력 기능 제공

#### 복습 모드 컴포넌트 (components/review/)

##### ReviewMode.tsx
- 복습 모드 페이지 컴포넌트
- 카드 복습 및 난이도 평가 기능 제공

##### ReviewCard.tsx
- 복습 카드 컴포넌트
- 질문, 답변, 해설 표시

##### DifficultyRating.tsx
- 난이도 평가 컴포넌트
- 1-5 척도의 난이도 평가 버튼 제공

##### ReviewProgress.tsx
- 복습 진행 상황 표시 컴포넌트
- 진행률 및 남은 카드 수 표시

#### 노트 에디터 컴포넌트 (components/notes/)

##### NoteEditor.tsx
- 노트 에디터 컴포넌트
- 마크다운 기반 노트 작성 및 편집 기능 제공

#### 페이지 컴포넌트 (pages/)

##### index.tsx
- 메인 페이지 (대시보드)

##### graph.tsx
- 개념 그래프 페이지

##### concept/[id].tsx
- 개념 상세 페이지

##### learning/[id].tsx
- 학습 모드 페이지

##### review.tsx
- 복습 모드 페이지

##### concept/[id]/notes/new.tsx
- 새 노트 작성 페이지

##### concept/[id]/notes/[noteId]/edit.tsx
- 노트 편집 페이지

#### API 클라이언트 (api/)

##### client.ts
- API 클라이언트 구현
- 백엔드 API 호출 함수 제공

#### 설정 파일

##### next.config.js
- Next.js 설정 파일
- API 프록시 설정

## 7. 설치 및 실행 방법

### 7.1 백엔드 설치 및 실행
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 7.2 프론트엔드 설치 및 실행
```bash
cd frontend
npm install
npm run dev
```

### 7.3 접속 방법
- 웹 브라우저에서 http://localhost:3000 접속

## 8. 향후 개선 사항

### 8.1 기능 개선
- 사용자 인증 및 권한 관리
- 다중 사용자 지원
- 학습 데이터 분석 및 시각화
- 소셜 기능 (공유, 협업)

### 8.2 기술적 개선
- 실제 LLM 통합 (LM Studio, Mistral, DeepSeek 등)
- PostgreSQL 등 확장성 있는 데이터베이스로 마이그레이션
- 테스트 코드 작성 및 CI/CD 파이프라인 구축
- 도커 컨테이너화 및 클라우드 배포

## 9. 결론

개념 그래프 학습 시스템은 사용자가 자기 주도적으로 학습할 수 있는 환경을 제공합니다. 개념 그래프를 통한 지식 시각화, LLM과의 상호작용을 통한 학습, 간격 반복 기법을 활용한 복습 기능을 통해 효과적인 학습 경험을 제공합니다. 이 시스템은 교재 기반이 아닌 주제 중심의 학습을 지원하며, 사용자의 학습 흐름을 시각화하고 관리할 수 있는 도구를 제공합니다.
