from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, distinct
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

import models
import schemas
from database import get_db

router = APIRouter()

# 학습 통계 엔드포인트
@router.get("/learning-stats", response_model=schemas.LearningStats)
def get_learning_stats(db: Session = Depends(get_db)):
    """
    전체 학습 통계를 반환합니다.
    """
    # 총 개념 수
    total_concepts = db.query(func.count(models.Concept.id)).scalar()
    
    # 총 카드 수
    total_cards = db.query(func.count(models.Card.id)).scalar()
    
    # 총 복습 수
    total_reviews = db.query(func.count(models.Review.id)).scalar()
    
    # 복습 난이도 분포
    difficulty_distribution = (
        db.query(
            models.Review.difficulty,
            func.count(models.Review.id).label("count")
        )
        .group_by(models.Review.difficulty)
        .all()
    )
    
    difficulty_stats = {
        "distribution": [
            {"difficulty": item[0], "count": item[1]}
            for item in difficulty_distribution
        ]
    }
    
    # 학습 활동 내역
    learning_history = (
        db.query(
            models.LearningHistory.activity_type,
            func.count(models.LearningHistory.id).label("count")
        )
        .group_by(models.LearningHistory.activity_type)
        .all()
    )
    
    activity_stats = [
        {"type": item[0], "count": item[1]}
        for item in learning_history
    ]
    
    return {
        "total_concepts": total_concepts,
        "total_cards": total_cards,
        "total_reviews": total_reviews,
        "difficulty_stats": difficulty_stats,
        "activity_stats": activity_stats
    }

@router.get("/concept-stats/{concept_id}", response_model=schemas.ConceptStats)
def get_concept_stats(concept_id: int, db: Session = Depends(get_db)):
    """
    특정 개념에 대한 학습 통계를 반환합니다.
    """
    # 개념 존재 확인
    concept = db.query(models.Concept).filter(models.Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # 관련 카드 수
    cards_count = db.query(func.count(models.Card.id)).filter(
        models.Card.concept_id == concept_id
    ).scalar()
    
    # 복습 기록
    reviews = (
        db.query(models.Review)
        .join(models.Card, models.Card.id == models.Review.card_id)
        .filter(models.Card.concept_id == concept_id)
        .all()
    )
    
    # 평균 난이도
    avg_difficulty = 0
    if reviews:
        avg_difficulty = sum(review.difficulty for review in reviews) / len(reviews)
    
    # 학습 활동 내역
    learning_activities = (
        db.query(models.LearningHistory)
        .filter(models.LearningHistory.concept_id == concept_id)
        .order_by(models.LearningHistory.created_at.desc())
        .limit(10)
        .all()
    )
    
    return {
        "concept_id": concept_id,
        "concept_name": concept.name,
        "cards_count": cards_count,
        "reviews_count": len(reviews),
        "avg_difficulty": round(avg_difficulty, 2),
        "recent_activities": [
            {
                "id": activity.id,
                "type": activity.activity_type,
                "created_at": activity.created_at
            }
            for activity in learning_activities
        ]
    }

@router.get("/review-stats", response_model=schemas.ReviewStats)
def get_review_stats(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    복습 통계를 반환합니다. 선택적으로 날짜 범위를 지정할 수 있습니다.
    """
    query = db.query(models.Review)
    
    # 날짜 필터 적용
    if start_date:
        query = query.filter(models.Review.created_at >= start_date)
    if end_date:
        query = query.filter(models.Review.created_at <= end_date)
    
    reviews = query.all()
    
    # 일별 복습 통계
    today = datetime.now().date()
    daily_stats = {}
    
    # 최근 30일 통계 초기화
    for i in range(30):
        day = (today - timedelta(days=i)).isoformat()
        daily_stats[day] = {"count": 0, "avg_difficulty": 0}
    
    # 통계 계산
    for review in reviews:
        day = review.created_at.date().isoformat()
        if day in daily_stats:
            daily_stats[day]["count"] += 1
            # 누적 합 계산 (나중에 평균 계산)
            daily_stats[day]["avg_difficulty"] += review.difficulty
    
    # 평균 계산
    for day, stats in daily_stats.items():
        if stats["count"] > 0:
            stats["avg_difficulty"] = round(stats["avg_difficulty"] / stats["count"], 2)
    
    # 난이도별 기억 유지율 계산 (간단한 추정)
    retention_rates = {
        1: 0.6,  # 매우 어려움: 약 60% 기억
        2: 0.7,  # 어려움: 약 70% 기억
        3: 0.8,  # 보통: 약 80% 기억
        4: 0.9,  # 쉬움: 약 90% 기억
        5: 0.95  # 매우 쉬움: 약 95% 기억
    }
    
    difficulty_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in reviews:
        if 1 <= review.difficulty <= 5:
            difficulty_counts[review.difficulty] += 1
    
    total_reviews = len(reviews)
    retention_stats = []
    
    for diff, count in difficulty_counts.items():
        if total_reviews > 0:
            percentage = round((count / total_reviews) * 100, 2)
        else:
            percentage = 0
            
        retention_stats.append({
            "difficulty": diff,
            "count": count,
            "percentage": percentage,
            "estimated_retention": retention_rates.get(diff, 0)
        })
    
    # 통계 반환
    return {
        "total_reviews": total_reviews,
        "daily_stats": [
            {"date": date, "count": stats["count"], "avg_difficulty": stats["avg_difficulty"]}
            for date, stats in daily_stats.items()
        ],
        "retention_stats": retention_stats
    }

@router.get("/progress-stats", response_model=schemas.ProgressStats)
def get_progress_stats(db: Session = Depends(get_db)):
    """
    전체 학습 진행 상황을 반환합니다.
    """
    # 총 개념 수
    total_concepts = db.query(func.count(models.Concept.id)).scalar()
    
    # 학습한 개념 수 (적어도 하나의 학습 활동이 있는 개념)
    learned_concepts = db.query(func.count(distinct(models.LearningHistory.concept_id))).scalar()
    
    # 복습 중인 카드 수 (적어도 하나의 복습 기록이 있는 카드)
    reviewed_cards = db.query(func.count(distinct(models.Review.card_id))).scalar()
    
    # 총 카드 수
    total_cards = db.query(func.count(models.Card.id)).scalar()
    
    # 오늘 복습 예정 카드 수
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    due_cards = db.query(func.count(models.Review.id)).filter(
        models.Review.next_review_date.between(today_start, today_end)
    ).scalar()
    
    # 월별 학습 활동 통계
    monthly_activities = []
    
    # 최근 12개월 통계
    now = datetime.now()
    for i in range(12):
        month_start = datetime(now.year, now.month, 1) - timedelta(days=30*i)
        month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(seconds=1)
        
        month_name = month_start.strftime("%Y-%m")
        
        # 해당 월의 학습 활동 수
        activity_count = db.query(func.count(models.LearningHistory.id)).filter(
            models.LearningHistory.created_at.between(month_start, month_end)
        ).scalar()
        
        # 해당 월의 복습 수
        review_count = db.query(func.count(models.Review.id)).filter(
            models.Review.created_at.between(month_start, month_end)
        ).scalar()
        
        monthly_activities.append({
            "month": month_name,
            "learning_count": activity_count,
            "review_count": review_count
        })
    
    return {
        "total_concepts": total_concepts,
        "learned_concepts": learned_concepts,
        "learning_progress": round((learned_concepts / total_concepts) * 100, 2) if total_concepts > 0 else 0,
        "total_cards": total_cards,
        "reviewed_cards": reviewed_cards,
        "review_progress": round((reviewed_cards / total_cards) * 100, 2) if total_cards > 0 else 0,
        "due_today": due_cards,
        "monthly_activities": monthly_activities
    }
__all__ = ["router"]