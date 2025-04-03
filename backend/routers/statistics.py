import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db  # 이게 backend/database.py에 있다면 상대경로로도 가능

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/learning-stats")
def get_learning_stats(db: Session = Depends(get_db)):
    try:
        # 예시: 통계 데이터를 DB에서 조회하거나 임시로 구성
        stats_data = {
            "total_users": 120,
            "active_sessions": 45,
            "learning_progress_avg": 76.3
        }

        logger.info("Learning stats endpoint called successfully")
        return stats_data

    except Exception as e:
        logger.error(f"Error in learning stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
