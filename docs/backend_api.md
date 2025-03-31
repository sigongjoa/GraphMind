# 개념 그래프 기반 학습 시스템 - 백엔드 API 설계

## 1. API 개요

개념 그래프 기반 학습 시스템의 백엔드 API는 다음과 같은 주요 기능을 제공합니다:

- 사용자 관리
- 개념 관리
- 개념 연결 관리
- 학습 카드 관리
- 복습 일정 관리
- LLM 서비스 연동

## 2. API 엔드포인트

### 2.1 사용자 관리 API

| 메소드 | 엔드포인트        | 설명                | 요청 본문                           | 응답                                |
|-------|------------------|--------------------|------------------------------------|-------------------------------------|
| POST  | /api/users       | 사용자 등록          | {username, email}                  | {id, username, email, created_at}   |
| GET   | /api/users/{id}  | 사용자 정보 조회      | -                                  | {id, username, email, created_at}   |
| PUT   | /api/users/{id}  | 사용자 정보 수정      | {username, email}                  | {id, username, email, updated_at}   |
| DELETE| /api/users/{id}  | 사용자 삭제          | -                                  | {success: true}                     |

### 2.2 개념 관리 API

| 메소드 | 엔드포인트                | 설명                | 요청 본문                           | 응답                                        |
|-------|--------------------------|--------------------|------------------------------------|---------------------------------------------|
| POST  | /api/concepts            | 개념 생성           | {name, description, user_id}       | {id, name, description, user_id, created_at}|
| GET   | /api/concepts/{id}       | 개념 조회           | -                                  | {id, name, description, user_id, created_at}|
| GET   | /api/concepts            | 개념 목록 조회       | ?user_id=1&limit=10&offset=0       | [{id, name, description, ...}, ...]         |
| PUT   | /api/concepts/{id}       | 개념 수정           | {name, description}                | {id, name, description, updated_at}         |
| DELETE| /api/concepts/{id}       | 개념 삭제           | -                                  | {success: true}                             |
| GET   | /api/users/{id}/concepts | 사용자별 개념 목록 조회| ?limit=10&offset=0                 | [{id, name, description, ...}, ...]         |

### 2.3 개념 연결 관리 API

| 메소드 | 엔드포인트                      | 설명                | 요청 본문                                | 응답                                                |
|-------|--------------------------------|--------------------|-----------------------------------------|-----------------------------------------------------|
| POST  | /api/connections               | 연결 생성           | {source_id, target_id, relation, strength}| {id, source_id, target_id, relation, strength, ...} |
| GET   | /api/connections/{id}          | 연결 조회           | -                                       | {id, source_id, target_id, relation, strength, ...} |
| GET   | /api/concepts/{id}/connections | 개념의 연결 목록 조회 | ?direction=outgoing&limit=10&offset=0   | [{id, source_id, target_id, relation, ...}, ...]    |
| PUT   | /api/connections/{id}          | 연결 수정           | {relation, strength}                    | {id, source_id, target_id, relation, updated_at}    |
| DELETE| /api/connections/{id}          | 연결 삭제           | -                                       | {success: true}                                     |
| GET   | /api/graph                     | 전체 그래프 데이터 조회| ?user_id=1                              | {nodes: [...], edges: [...]}                        |

### 2.4 학습 카드 관리 API

| 메소드 | 엔드포인트                  | 설명                | 요청 본문                                | 응답                                             |
|-------|----------------------------|--------------------|-----------------------------------------|--------------------------------------------------|
| POST  | /api/cards                 | 카드 생성           | {concept_id, question, answer, explanation}| {id, concept_id, question, answer, created_at}  |
| GET   | /api/cards/{id}            | 카드 조회           | -                                       | {id, concept_id, question, answer, explanation}  |
| GET   | /api/concepts/{id}/cards   | 개념별 카드 목록 조회 | ?limit=10&offset=0                      | [{id, concept_id, question, answer, ...}, ...]   |
| PUT   | /api/cards/{id}            | 카드 수정           | {question, answer, explanation}         | {id, concept_id, question, answer, updated_at}   |
| DELETE| /api/cards/{id}            | 카드 삭제           | -                                       | {success: true}                                  |

### 2.5 복습 관리 API

| 메소드 | 엔드포인트                      | 설명                | 요청 본문                                | 응답                                                |
|-------|--------------------------------|--------------------|-----------------------------------------|-----------------------------------------------------|
| POST  | /api/reviews                   | 복습 기록 생성       | {card_id, user_id, score}               | {id, card_id, user_id, score, next_review, ...}     |
| GET   | /api/users/{id}/reviews        | 사용자별 복습 기록 조회| ?limit=10&offset=0                      | [{id, card_id, user_id, score, next_review, ...}, ...]|
| GET   | /api/users/{id}/due-reviews    | 예정된 복습 목록 조회 | ?limit=10&offset=0                      | [{id, card_id, question, answer, next_review, ...}, ...]|
| GET   | /api/cards/{id}/reviews        | 카드별 복습 기록 조회 | ?user_id=1&limit=10&offset=0            | [{id, user_id, score, next_review, ...}, ...]       |

### 2.6 LLM 서비스 API

| 메소드 | 엔드포인트                      | 설명                | 요청 본문                                | 응답                                                |
|-------|--------------------------------|--------------------|-----------------------------------------|-----------------------------------------------------|
| POST  | /api/llm/explain               | 개념 설명 요청       | {concept_name}                          | {explanation}                                       |
| POST  | /api/llm/generate-question     | 문제 생성 요청       | {concept_id, difficulty}                | {question, answer, explanation}                     |
| POST  | /api/llm/recommend-concepts    | 관련 개념 추천 요청   | {concept_id}                            | {related_concepts: [{id, name, relation}, ...]}     |

## 3. API 구현 세부 사항

### 3.1 FastAPI 구현 구조

```python
# main.py
from fastapi import FastAPI
from routers import users, concepts, connections, cards, reviews, llm

app = FastAPI(
    title="개념 그래프 기반 학습 시스템 API",
    description="개념 그래프 기반 학습 시스템의 백엔드 API",
    version="1.0.0"
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(concepts.router, prefix="/api/concepts", tags=["concepts"])
app.include_router(connections.router, prefix="/api/connections", tags=["connections"])
app.include_router(cards.router, prefix="/api/cards", tags=["cards"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(llm.router, prefix="/api/llm", tags=["llm"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Concept Graph Learning System API"}
```

### 3.2 데이터 모델

```python
# models.py
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    concepts = relationship("Concept", back_populates="user")
    reviews = relationship("ReviewHistory", back_populates="user")

class Concept(Base):
    __tablename__ = "concepts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    user = relationship("User", back_populates="concepts")
    cards = relationship("Card", back_populates="concept")
    outgoing_connections = relationship("Connection", foreign_keys="Connection.source_id", back_populates="source")
    incoming_connections = relationship("Connection", foreign_keys="Connection.target_id", back_populates="target")

class Connection(Base):
    __tablename__ = "connections"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    relation = Column(String(50), nullable=False)
    strength = Column(Float, default=0.5, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    source = relationship("Concept", foreign_keys=[source_id], back_populates="outgoing_connections")
    target = relationship("Concept", foreign_keys=[target_id], back_populates="incoming_connections")

class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    explanation = Column(Text)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    concept = relationship("Concept", back_populates="cards")
    reviews = relationship("ReviewHistory", back_populates="card")

class ReviewHistory(Base):
    __tablename__ = "review_history"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    next_review = Column(DateTime, nullable=False)
    reviewed_at = Column(DateTime, server_default=func.now(), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    card = relationship("Card", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
```

### 3.3 스키마 정의

```python
# schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User 스키마
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    username: Optional[str] = None
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Concept 스키마
class ConceptBase(BaseModel):
    name: str
    description: Optional[str] = None

class ConceptCreate(ConceptBase):
    user_id: int

class ConceptUpdate(ConceptBase):
    name: Optional[str] = None
    description: Optional[str] = None

class ConceptResponse(ConceptBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Connection 스키마
class ConnectionBase(BaseModel):
    source_id: int
    target_id: int
    relation: str
    strength: float = 0.5

class ConnectionCreate(ConnectionBase):
    pass

class ConnectionUpdate(BaseModel):
    relation: Optional[str] = None
    strength: Optional[float] = None

class ConnectionResponse(ConnectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Card 스키마
class CardBase(BaseModel):
    concept_id: int
    question: str
    answer: str
    explanation: Optional[str] = None

class CardCreate(CardBase):
    pass

class CardUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None

class CardResponse(CardBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Review 스키마
class ReviewBase(BaseModel):
    card_id: int
    user_id: int
    score: int

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    next_review: datetime
    reviewed_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# LLM 요청/응답 스키마
class ExplainRequest(BaseModel):
    concept_name: str

class ExplainResponse(BaseModel):
    explanation: str

class GenerateQuestionRequest(BaseModel):
    concept_id: int
    difficulty: Optional[int] = 1  # 1-5 난이도

class GenerateQuestionResponse(BaseModel):
    question: str
    answer: str
    explanation: Optional[str] = None

class RecommendConceptsRequest(BaseModel):
    concept_id: int

class RelatedConcept(BaseModel):
    id: int
    name: str
    relation: str

class RecommendConceptsResponse(BaseModel):
    related_concepts: List[RelatedConcept]

# 그래프 데이터 스키마
class GraphNode(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

class GraphEdge(BaseModel):
    id: int
    source: int
    target: int
    relation: str
    strength: float

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
```

### 3.4 복습 알고리즘 (SM-2)

```python
# spaced_repetition.py
from datetime import datetime, timedelta

def calculate_next_review(score, previous_interval=1, previous_ef=2.5):
    """
    SM-2 알고리즘을 사용하여 다음 복습 시간을 계산합니다.
    
    Args:
        score: 0-5 사이의 점수 (0: 완전히 잊음, 5: 완벽히 기억)
        previous_interval: 이전 복습 간격 (일)
        previous_ef: 이전 난이도 계수 (Easiness Factor)
        
    Returns:
        tuple: (next_interval, new_ef)
    """
    if score < 3:
        # 3점 미만은 다시 학습 필요
        return 1, previous_ef
    
    # 난이도 계수 (EF) 계산
    new_ef = previous_ef + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
    
    # EF는 최소 1.3으로 제한
    if new_ef < 1.3:
        new_ef = 1.3
    
    # 다음 복습 간격 계산
    if score == 3:
        next_interval = previous_interval
    elif score == 4:
        next_interval = previous_interval * new_ef
    else:  # score == 5
        next_interval = previous_interval * new_ef * 1.3
    
    # 간격을 정수로 반올림
    next_interval = round(next_interval)
    
    # 최소 간격은 1일
    if next_interval < 1:
        next_interval = 1
    
    return next_interval, new_ef

def get_next_review_date(score, previous_interval=1, previous_ef=2.5):
    """
    다음 복습 날짜를 계산합니다.
    
    Args:
        score: 0-5 사이의 점수
        previous_interval: 이전 복습 간격 (일)
        previous_ef: 이전 난이도 계수
        
    Returns:
        datetime: 다음 복습 날짜
    """
    next_interval, _ = calculate_next_review(score, previous_interval, previous_ef)
    return datetime.now() + timedelta(days=next_interval)
```

## 4. API 응답 예시

### 4.1 개념 생성 응답

```json
{
  "id": 1,
  "name": "소프트웨어 공학",
  "description": "소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문",
  "user_id": 1,
  "created_at": "2025-03-31T02:10:00",
  "updated_at": "2025-03-31T02:10:00"
}
```

### 4.2 그래프 데이터 조회 응답

```json
{
  "nodes": [
    {
      "id": 1,
      "name": "소프트웨어 공학",
      "description": "소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문"
    },
    {
      "id": 2,
      "name": "요구사항 분석",
      "description": "소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정"
    },
    {
      "id": 3,
      "name": "유지보수",
      "description": "소프트웨어를 인도한 후에 결함을 수정하고, 성능을 개선하며, 변화된 환경에 적응시키는 과정"
    }
  ],
  "edges": [
    {
      "id": 1,
      "source": 2,
      "target": 1,
      "relation": "하위 개념",
      "strength": 0.8
    },
    {
      "id": 2,
      "source": 3,
      "target": 1,
      "relation": "하위 개념",
      "strength": 0.7
    }
  ]
}
```

### 4.3 LLM 문제 생성 응답

```json
{
  "question": "소프트웨어 유지보수의 4가지 유형을 설명하시오.",
  "answer": "소프트웨어 유지보수의 4가지 유형은 다음과 같습니다:\n1. 수정 유지보수(Corrective): 소프트웨어의 결함을 수정하는 활동\n2. 적응 유지보수(Adaptive): 변화된 환경에 소프트웨어를 적응시키는 활동\n3. 완전 유지보수(Perfective): 소프트웨어의 기능을 개선하거나 성능을 향상시키는 활동\n4. 예방 유지보수(Preventive): 미래의 문제를 예방하기 위해 소프트웨어를 개선하는 활동",
  "explanation": "소프트웨어 유지보수는 소프트웨어 생명주기의 중요한 부분으로, 전체 소프트웨어 비용의 약 60-80%를 차지합니다. 각 유형은 서로 다른 목적을 가지고 있으며, 소프트웨어의 지속적인 가치를 유지하는 데 필수적입니다."
}
```

## 5. 오류 처리

API는 다음과 같은 HTTP 상태 코드를 사용하여 오류를 처리합니다:

- 200 OK: 요청 성공
- 201 Created: 리소스 생성 성공
- 400 Bad Request: 잘못된 요청 (요청 본문 형식 오류 등)
- 404 Not Found: 리소스를 찾을 수 없음
- 422 Unprocessable Entity: 유효성 검사 오류
- 500 Internal Server Error: 서버 내부 오류

오류 응답 예시:

```json
{
  "detail": {
    "message": "Concept with id 999 not found",
    "code": "resource_not_found"
  }
}
```

## 6. API 보안

- CORS (Cross-Origin Resource Sharing) 설정
- 요청 속도 제한 (Rate Limiting)
- 입력 유효성 검사
- 오류 로깅

## 7. API 문서화

FastAPI의 자동 문서화 기능을 활용하여 API 문서를 제공합니다:

- Swagger UI: `/docs`
- ReDoc: `/redoc`
