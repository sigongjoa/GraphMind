from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

# 난이도 분포 아이템
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
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True

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
        orm_mode = True