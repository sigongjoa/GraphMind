from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

# 필요한 모델과 스키마 import
import models
import schemas
from database import get_db

# APIRouter 생성
router = APIRouter()

@router.get("/due", response_model=List[schemas.Review])
def get_due_reviews(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100
):
    try:
        today = datetime.now().date()
        due_reviews = (
            db.query(models.Review)
            .filter(models.Review.next_review_date <= today)
            .offset(skip)
            .limit(limit)
            .all()
        )
        return due_reviews
    except Exception as e:
        # 오류 발생 시 HTTP 예외 처리
        raise HTTPException(status_code=500, detail=f"데이터를 가져오는 중 오류 발생: {str(e)}")