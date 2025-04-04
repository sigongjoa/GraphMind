from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Dict, Any
import logging

from database import get_db
from sqlalchemy.orm import Session
import schemas
from services.llm_service import LLMServiceFactory
from backend.config import settings


# 로거 설정
logger = logging.getLogger(__name__)

# API 라우터 생성
router = APIRouter()

# LLM 서비스 의존성
def get_llm_service():
    return LLMServiceFactory.create_service(
        use_mock=settings.USE_MOCK_LLM,
        api_url=settings.LLM_API_URL
    )

# LLM 서비스 상태 확인
@router.get("/health", response_model=Dict[str, Any])
def check_llm_health(llm_service=Depends(get_llm_service)):
    """
    LLM 서비스의 상태를 확인합니다.
    """
    try:
        health_info = llm_service.get_health_check()
        return health_info
    except Exception as e:
        logger.error(f"LLM 상태 확인 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"LLM 서비스 상태 확인 중 오류: {str(e)}"
        )

# 개념 설명 엔드포인트
@router.post("/explain", response_model=schemas.LLMResponse)
def explain_concept(
    request: schemas.LLMRequest,
    llm_service=Depends(get_llm_service),
    db: Session = Depends(get_db)
):
    """
    개념에 대한 설명을 제공합니다.
    """
    from config import settings
    print("🔥 DEBUG - USE_MOCK_LLM =", settings.USE_MOCK_LLM)
    print("🔥 DEBUG - LLM_API_URL =", settings.LLM_API_URL)
    try:
        result = llm_service.explain_concept(request.concept, request.context)
        return result
    except Exception as e:
        logger.error(f"개념 설명 생성 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"개념 설명 생성 중 오류: {str(e)}"
        )

# 문제 생성 엔드포인트
@router.post("/generate-question", response_model=schemas.LLMQuestionResponse)
def generate_question(
    request: schemas.LLMRequest,
    difficulty: int = 1,
    llm_service=Depends(get_llm_service),
    db: Session = Depends(get_db)
):
    """
    개념에 대한 학습 문제를 생성합니다.
    """
    try:
        # 난이도 검증
        if not 1 <= difficulty <= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="난이도는 1에서 5 사이의 값이어야 합니다."
            )
        
        result = llm_service.generate_question(request.concept, difficulty)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"문제 생성 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"문제 생성 중 오류: {str(e)}"
        )

# 관련 개념 추천 엔드포인트
@router.post("/suggest-concepts", response_model=schemas.LLMConceptsResponse)
def suggest_concepts(
    request: schemas.LLMRequest,
    llm_service=Depends(get_llm_service),
    db: Session = Depends(get_db)
):
    """
    관련 개념을 추천합니다.
    """
    try:
        result = llm_service.suggest_concepts(request.concept)
        return result
    except Exception as e:
        logger.error(f"관련 개념 추천 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"관련 개념 추천 중 오류: {str(e)}"
        )

# 노트 요약 엔드포인트
@router.post("/summarize-notes", response_model=schemas.LLMResponse)
def summarize_notes(
    notes: str,
    llm_service=Depends(get_llm_service)
):
    """
    학습 노트를 요약합니다.
    """
    try:
        summary = llm_service.summarize_notes(notes)
        return {"response": summary}
    except Exception as e:
        logger.error(f"노트 요약 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"노트 요약 중 오류: {str(e)}"
        )

# 학습 계획 생성 엔드포인트
@router.post("/generate-study-plan", response_model=schemas.LLMResponse)
def generate_study_plan(
    request: schemas.LLMRequest,
    duration_days: int = 7,
    llm_service=Depends(get_llm_service)
):
    """
    학습 계획을 생성합니다.
    """
    try:
        plan = llm_service.generate_study_plan(request.concept, duration_days)
        return {"response": plan}
    except Exception as e:
        logger.error(f"학습 계획 생성 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"학습 계획 생성 중 오류: {str(e)}"
        )