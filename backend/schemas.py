from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# 개념 스키마
class ConceptBase(BaseModel):
    name: str
    description: str

class ConceptCreate(ConceptBase):
    pass

class ConceptUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Concept(ConceptBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# 개념 상세 정보 (관련 개념 포함)
class RelatedConcept(BaseModel):
    id: int
    name: str
    relation: str

    class Config:
        orm_mode = True

class ConceptDetail(Concept):
    related_concepts: List[RelatedConcept] = []

    class Config:
        orm_mode = True

# 연결 스키마
class ConnectionBase(BaseModel):
    source_id: int
    target_id: int
    relation: str
    strength: float = 1.0

class ConnectionCreate(ConnectionBase):
    pass

class Connection(ConnectionBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# 카드 스키마
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

class Card(CardBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# 복습 스키마
class ReviewBase(BaseModel):
    card_id: int
    difficulty: int  # 1-5 난이도 평가
    next_review_date: datetime

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# 노트 스키마
class NoteBase(BaseModel):
    concept_id: int
    title: str
    content: str

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Note(NoteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# 학습 이력 스키마
class LearningHistoryBase(BaseModel):
    concept_id: int
    activity_type: str  # "learning", "review", "note"

class LearningHistoryCreate(LearningHistoryBase):
    pass

class LearningHistory(LearningHistoryBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# LLM 통합 스키마
class LLMRequest(BaseModel):
    concept: str
    context: Optional[str] = None

class LLMResponse(BaseModel):
    response: str

class LLMQuestionResponse(BaseModel):
    question: str
    answer: str
    explanation: Optional[str] = None

class LLMConceptSuggestion(BaseModel):
    name: str
    relation: str

class LLMConceptsResponse(BaseModel):
    concepts: List[LLMConceptSuggestion]
