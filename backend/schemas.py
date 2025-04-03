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
        from_attributes= True

# 개념 상세 정보 (관련 개념 포함)
class RelatedConcept(BaseModel):
    id: int
    name: str
    relation: str

    class Config:
        from_attributes= True

class ConceptDetail(Concept):
    related_concepts: List[RelatedConcept] = []

    class Config:
        from_attributes= True

# 연결 스키마
class ConnectionBase(BaseModel):
    source_id: int
    target_id: int
    relation: Optional[str] = None
    strength: Optional[float] = 1.0

class ConnectionCreate(ConnectionBase):
    pass

class ConnectionUpdate(BaseModel):
    relation: Optional[str] = None
    strength: Optional[float] = None

class Connection(ConnectionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes= True

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
        from_attributes= True

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
        from_attributes= True

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
        from_attributes= True

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
        from_attributes= True

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

class DifficultyDistributionItem(BaseModel):
    difficulty: int
    count: int

# 난이도 통계
class DifficultyStats(BaseModel):
    distribution: List[DifficultyDistributionItem]

# 활동 통계 아이템
class ActivityStatsItem(BaseModel):
    type: str
    count: int

# 학습 통계 응답 모델
class LearningStats(BaseModel):
    total_concepts: int
    total_cards: int
    total_reviews: int
    difficulty_stats: DifficultyStats
    activity_stats: List[ActivityStatsItem]

    class Config:
        from_attributes= True

# 학습 활동 아이템
class LearningActivityItem(BaseModel):
    id: int
    type: str
    created_at: datetime

# 개념 통계 응답 모델
class ConceptStats(BaseModel):
    concept_id: int
    concept_name: str
    cards_count: int
    reviews_count: int
    avg_difficulty: float
    recent_activities: List[LearningActivityItem]

    class Config:
        from_attributes= True

# 일별 복습 통계 아이템
class DailyReviewStats(BaseModel):
    date: str
    count: int
    avg_difficulty: float

# 난이도별 기억 유지율 아이템
class RetentionStatsItem(BaseModel):
    difficulty: int
    count: int
    percentage: float
    estimated_retention: float

# 복습 통계 응답 모델
class ReviewStats(BaseModel):
    total_reviews: int
    daily_stats: List[DailyReviewStats]
    retention_stats: List[RetentionStatsItem]

    class Config:
        from_attributes= True

# 월별 학습 활동 아이템
class MonthlyActivityItem(BaseModel):
    month: str
    learning_count: int
    review_count: int

# 진행 상황 통계 응답 모델
class ProgressStats(BaseModel):
    total_concepts: int
    learned_concepts: int
    learning_progress: float  # 백분율
    total_cards: int
    reviewed_cards: int
    review_progress: float  # 백분율
    due_today: int
    monthly_activities: List[MonthlyActivityItem]

    class Config:
        from_attributes= True