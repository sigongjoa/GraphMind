from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

import models
import schemas
from database import get_db
import crud

# APIRouter 생성
router = APIRouter()

@router.get("/", response_model=List[schemas.Review])
def get_reviews(
    card_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100
):
    """
    모든 복습 기록 또는 특정 카드의 복습 기록을 가져옵니다.
    """
    if card_id:
        return crud.get_reviews_by_card(db, card_id, skip, limit)
    return crud.get_reviews(db, skip, limit)

@router.get("/due", response_model=List[schemas.Review])
def get_due_reviews(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100
):
    """
    오늘 복습해야 할 카드들의 복습 기록을 가져옵니다.
    """
    try:
        now = datetime.now()
        due_reviews = (
            db.query(models.Review)
            .filter(models.Review.next_review_date <= now)
            .offset(skip)
            .limit(limit)
            .all()
        )
        return due_reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터를 가져오는 중 오류 발생: {str(e)}")

@router.post("/", response_model=schemas.Review)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db)
):
    """
    새로운 복습 기록을 생성합니다.
    """
    # 카드가 존재하는지 확인
    card = crud.get_card(db, review.card_id)
    if not card:
        raise HTTPException(status_code=404, detail=f"Card with id {review.card_id} not found")
    
    # 난이도 검증
    if not 1 <= review.difficulty <= 5:
        raise HTTPException(status_code=400, detail="Difficulty must be between 1 and 5")
    
    # 복습 기록 생성
    return crud.create_review(db, review)

@router.get("/{review_id}", response_model=schemas.Review)
def get_review(
    review_id: int,
    db: Session = Depends(get_db)
):
    """
    특정 ID의 복습 기록을 가져옵니다.
    """
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail=f"Review with id {review_id} not found")
    return review

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db)
):
    """
    특정 ID의 복습 기록을 삭제합니다.
    """
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail=f"Review with id {review_id} not found")
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}

@router.get("/calculate-next-date")
def calculate_next_review_date(
    difficulty: int,
    repetitions: int = 0
):
    """
    SM-2 알고리즘을 사용하여 다음 복습 일정을 계산합니다.
    """
    # 파라미터 검증
    if not 1 <= difficulty <= 5:
        raise HTTPException(status_code=400, detail="Difficulty must be between 1 and 5")
    
    # 다음 복습 일정 계산
    next_date = crud.calculate_next_review_date(difficulty, repetitions)
    
    return {
        "next_review_date": next_date,
        "days_interval": (next_date - datetime.now()).days
    }