from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
import logging
import requests
from pydantic import BaseModel

import schemas
from database import get_db
from sqlalchemy.orm import Session

# 로그 설정
logger = logging.getLogger(__name__)

# 라우터 생성
router = APIRouter()

# LLM 서비스 URL (LM Studio 기본 설정)
LLM_API_URL = "http://localhost:1234/v1"

# LLM 서비스가 제대로 동작하는지 확인하는 함수
def check_llm_service():
    try:
        # LM Studio API 연결 확인
        response = requests.get(f"{LLM_API_URL}/models", timeout=3)
        if response.status_code == 200:
            return True
        return False
    except:
        return False

# LM Studio와 통신하는 함수
def generate_llm_response(prompt: str, max_tokens: int = 1024, temperature: float = 0.7):
    try:
        response = requests.post(
            f"{LLM_API_URL}/chat/completions",
            json={
                "model": "local-model",  # LM Studio는 일반적으로 local-model을 사용
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": temperature
            },
            timeout=60  # 타임아웃 설정
        )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            logger.error(f"LLM 응답 오류: {response.status_code}, {response.text}")
            return None
    except Exception as e:
        logger.error(f"LLM 요청 오류: {str(e)}")
        return None

# LLM 서비스 상태 확인 엔드포인트
@router.get("/health", response_model=Dict[str, Any])
def check_health():
    """LLM 서비스 상태를 확인합니다."""
    is_online = check_llm_service()
    
    if is_online:
        return {"status": "online", "message": "LLM 서비스가 정상적으로 동작 중입니다."}
    else:
        return {"status": "offline", "message": "LLM 서비스에 연결할 수 없습니다."}

# 개념 설명 엔드포인트
@router.post("/explain", response_model=schemas.LLMResponse)
def explain_concept(request: schemas.LLMRequest, db: Session = Depends(get_db)):
    """
    개념에 대한 설명을 생성합니다.
    """
    # LLM 서비스 확인
    if not check_llm_service():
        # LLM이 연결되지 않은 경우 기본 응답 제공
        return {"response": f"{request.concept}은(는) 중요한 개념입니다. (LLM 서비스가 오프라인 상태입니다)"}
    
    # 프롬프트 구성
    prompt = f"""당신은 학습 지원 AI 튜터입니다. 다음 개념에 대해 명확하고 교육적인 설명을 제공해주세요.

개념: {request.concept}

아래 형식을 따라 응답해주세요:
1. 간략한 정의 (1-2문장)
2. 중요성 또는 활용 (2-3문장)
3. 주요 특징 또는 구성 요소 (3-5개 항목)
4. 관련된 개념들 (2-3개)

설명:"""

    if request.context:
        prompt += f"\n\n추가 컨텍스트: {request.context}"
    
    # LLM 응답 생성
    response = generate_llm_response(prompt)
    
    if response:
        return {"response": response}
    else:
        return {"response": f"{request.concept}에 대한 설명을 생성하는 중 오류가 발생했습니다."}

# 관련 개념 추천 엔드포인트
@router.post("/suggest-concepts", response_model=schemas.LLMConceptsResponse)
def suggest_concepts(request: schemas.LLMRequest, db: Session = Depends(get_db)):
    """
    개념과 관련된 개념들을 추천합니다.
    """
    # LLM 서비스 확인
    if not check_llm_service():
        # LLM이 연결되지 않은 경우 기본 응답 제공
        return {
            "concepts": [
                {"name": f"{request.concept}의 기초", "relation": "선행 개념"},
                {"name": f"{request.concept}의 응용", "relation": "후행 개념"},
                {"name": f"{request.concept}의 유사 개념", "relation": "유사 개념"}
            ]
        }
    
    # 프롬프트 구성
    prompt = f"""당신은 교육 전문가입니다. 다음 개념과 관련된 개념들을 추천해주세요.

    개념: {request.concept}

    아래 기준에 따라 5개의 관련 개념을 추천해주세요:
    1. 선행 개념 (이 개념을 이해하기 위해 먼저 알아야 할 개념)
    2. 후행 개념 (이 개념을 배운 후 학습하면 좋은 개념)
    3. 유사 개념 (이 개념과 비슷하거나 비교되는 개념)

    다음 JSON 형식으로 응답해주세요:
    {{
    "concepts": [
        {{"name": "관련 개념 1", "relation": "관계 설명"}},
        {{"name": "관련 개념 2", "relation": "관계 설명"}},
        ...
    ]
    }}"""
        
    # LLM 응답 생성
    response = generate_llm_response(prompt)
    
    if response:
        # JSON 형식 추출 시도
        try:
            import json
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                return result
        except:
            pass
    
    # 파싱 실패 또는 응답 없음의 경우 기본 응답 제공
    return {
        "concepts": [
            {"name": f"{request.concept}의 기초", "relation": "선행 개념"},
            {"name": f"{request.concept}의 응용", "relation": "후행 개념"},
            {"name": f"{request.concept}의 유사 개념", "relation": "유사 개념"}
        ]
    }

# 문제 생성 엔드포인트
@router.post("/generate-question", response_model=schemas.LLMQuestionResponse)
def generate_question(request: schemas.LLMRequest, difficulty: int = 1, db: Session = Depends(get_db)):
    """
    개념에 대한 문제를 생성합니다.
    """
    # 난이도 검증
    if not 1 <= difficulty <= 5:
        difficulty = 1
    
    # LLM 서비스 확인
    if not check_llm_service():
        # LLM이 연결되지 않은 경우 기본 응답 제공
        return {
            "question": f"{request.concept}의 주요 특징은 무엇인가요?",
            "answer": f"{request.concept}의 주요 특징은 [특징 1], [특징 2], [특징 3] 등이 있습니다.",
            "explanation": f"이 문제는 {request.concept}의 기본적인 이해를 테스트합니다. (LLM 서비스가 오프라인 상태입니다)"
        }
    
    # 난이도 설명
    difficulty_desc = {
        1: "기본적인 개념 정의와 이해를 묻는 쉬운 수준",
        2: "개념의 주요 특징과 기본 응용을 묻는 수준",
        3: "개념의 심화 내용과 다른 개념과의 관계를 묻는 중간 수준",
        4: "개념의 복잡한 측면과 실제 적용 사례를 묻는 도전적인 수준",
        5: "개념의 고급 응용과 비판적 분석을 요구하는 어려운 수준"
    }
    
    # 프롬프트 구성
    prompt = f"""당신은 교육 콘텐츠 제작자입니다. 다음 개념에 대한 학습 문제를 생성해주세요.

개념: {request.concept}
난이도: {difficulty}/5 ({difficulty_desc.get(difficulty, "")})

1. 문제는 학생의 개념 이해도를 평가할 수 있어야 합니다.
2. 답변은 명확하고 정확해야 합니다.
3. 설명은 학습자가 개념을 더 깊이 이해할 수 있도록 도와야 합니다.

다음 JSON 형식으로 응답해주세요:
{{
  "question": "문제 내용",
  "answer": "정답",
  "explanation": "해설"
}}"""
    
    # LLM 응답 생성
    response = generate_llm_response(prompt)
    
    if response:
        # JSON 형식 추출 시도
        try:
            import json
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                return result
        except:
            pass
    
    # 파싱 실패 또는 응답 없음의 경우 기본 응답 제공
    return {
        "question": f"{request.concept}의 주요 특징은 무엇인가요?",
        "answer": f"{request.concept}의 주요 특징에는 다양한 요소가 포함됩니다.",
        "explanation": f"이 문제는 {request.concept}의 기본적인 이해를 테스트합니다."
    }