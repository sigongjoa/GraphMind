import os
import requests
import json
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class LLMService:
    """
    LM Studio를 통한 로컬 LLM 서비스 연동
    """
    
    def __init__(self, api_url: str = "http://localhost:1234/v1"):
        """
        LLM 서비스 초기화
        
        Args:
            api_url: LM Studio API URL
        """
        self.api_url = api_url
        logger.info(f"LLM 서비스 초기화: {api_url}")
    
    def _generate_completion(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """
        LLM에 프롬프트를 전송하고 응답을 받습니다.
        
        Args:
            prompt: LLM에 전송할 프롬프트
            temperature: 응답 다양성 조절 (0-1)
            max_tokens: 최대 생성 토큰 수
            
        Returns:
            str: LLM의 응답
        """
        try:
            response = requests.post(
                f"{self.api_url}/chat/completions",
                json={
                    "model": "local-model",  # LM Studio는 이 값을 무시하고 현재 로드된 모델 사용
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature,
                    "max_tokens": max_tokens
                },
                timeout=60  # LLM 응답은 시간이 걸릴 수 있으므로 타임아웃을 넉넉히 설정
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                error_msg = f"LLM API 오류: {response.status_code}, {response.text}"
                logger.error(error_msg)
                return f"오류 발생: {error_msg}"
                
        except requests.exceptions.RequestException as e:
            logger.error(f"LLM 요청 중 예외 발생: {e}")
            return "LLM 서비스에 연결할 수 없습니다. LM Studio가 실행 중인지 확인하세요."
    
    def explain_concept(self, concept_name: str, context: Optional[str] = None) -> Dict[str, str]:
        """
        개념에 대한 설명을 제공합니다.
        
        Args:
            concept_name: 설명을 요청할 개념 이름
            context: 추가 컨텍스트 (선택 사항)
            
        Returns:
            Dict[str, str]: 개념 설명을 포함한 응답
        """
        # 프롬프트 구성
        prompt = f"""당신은 학습 지원 AI 튜터입니다. 다음 개념에 대해 명확하고 교육적인 설명을 제공해주세요.

개념: {concept_name}

아래 형식을 따라 응답해주세요:
1. 간략한 정의 (1-2문장)
2. 중요성 또는 활용 (2-3문장)
3. 주요 특징 또는 구성 요소 (3-5개 항목)
4. 관련된 개념들 (2-3개)

설명:"""

        if context:
            prompt += f"\n\n추가 컨텍스트: {context}"
        
        # LLM 호출
        response = self._generate_completion(prompt)
        
        return {"response": response}
    
    def generate_question(self, concept_name: str, difficulty: int = 1) -> Dict[str, str]:
        """
        개념에 대한 학습 문제를 생성합니다.
        
        Args:
            concept_name: 문제를 생성할 개념 이름
            difficulty: 문제 난이도 (1-5)
            
        Returns:
            Dict[str, str]: 문제, 답변, 설명을 포함한 딕셔너리
        """
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

개념: {concept_name}
난이도: {difficulty}/5 ({difficulty_desc.get(difficulty, "")})

1. 문제는 학생의 개념 이해도를 평가할 수 있어야 합니다.
2. 답변은 명확하고 정확해야 합니다.
3. 설명은 학습자가 개념을 더 깊이 이해할 수 있도록 도와야 합니다.

다음 JSON 형식으로 응답해주세요:
{{
  "question": "문제 내용",
  "answer": "정답",
  "explanation": "해설"
}}

생성된 문제:"""
        
        # LLM 호출
        response = self._generate_completion(prompt)
        
        # JSON 추출 시도
        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                return result
        except Exception as e:
            logger.warning(f"JSON 파싱 실패: {e}, 원본 응답: {response}")
        
        # 파싱 실패 시 기본 형식으로 변환 시도
        try:
            lines = response.split('\n')
            question = ""
            answer = ""
            explanation = ""
            
            for line in lines:
                line = line.strip()
                if line.startswith("문제:") or line.startswith("Question:"):
                    question = line.split(":", 1)[1].strip()
                elif line.startswith("답변:") or line.startswith("Answer:"):
                    answer = line.split(":", 1)[1].strip()
                elif line.startswith("설명:") or line.startswith("Explanation:"):
                    explanation = line.split(":", 1)[1].strip()
            
            if question and answer:
                return {
                    "question": question,
                    "answer": answer,
                    "explanation": explanation
                }
        except Exception as e:
            logger.warning(f"대체 파싱 실패: {e}")
        
        # 모든 파싱 실패 시 원본 응답 반환
        return {
            "question": f"{concept_name}에 대해 설명하시오.",
            "answer": response,
            "explanation": ""
        }
    
    def suggest_concepts(self, concept_name: str) -> Dict[str, List[Dict[str, str]]]:
        """
        관련 개념을 추천합니다.
        
        Args:
            concept_name: 관련 개념을 추천할 개념 이름
            
        Returns:
            Dict[str, List[Dict[str, str]]]: 관련 개념 목록
        """
        # 프롬프트 구성
        prompt = f"""당신은 교육 전문가입니다. 다음 개념과 관련된 개념들을 추천해주세요.

개념: {concept_name}

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
}}

추천 결과:"""
        
        # LLM 호출
        response = self._generate_completion(prompt)
        
        # JSON 추출 시도
        try:
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                return result
        except Exception as e:
            logger.warning(f"JSON 파싱 실패: {e}, 원본 응답: {response}")
        
        # 파싱 실패 시 기본 응답 반환
        return {
            "concepts": [
                {"name": f"{concept_name}의 기초", "relation": "선행 개념"},
                {"name": f"{concept_name}의 응용", "relation": "후행 개념"},
                {"name": f"{concept_name}의 유사 개념", "relation": "유사 개념"}
            ]
        }

    def summarize_notes(self, notes: str) -> str:
        """
        학습 노트를 요약합니다.
        
        Args:
            notes: 요약할 노트 내용
            
        Returns:
            str: 요약된 노트
        """
        # 프롬프트 구성
        prompt = f"""다음 학습 노트를 핵심만 간결하게 요약해주세요:

{notes}

요약 (3-5개의 핵심 포인트):"""
        
        # LLM 호출
        return self._generate_completion(prompt, max_tokens=512)
    
    def generate_study_plan(self, concept_name: str, duration_days: int = 7) -> str:
        """
        학습 계획을 생성합니다.
        
        Args:
            concept_name: 학습 계획을 생성할 개념 이름
            duration_days: 학습 기간 (일)
            
        Returns:
            str: 학습 계획
        """
        # 프롬프트 구성
        prompt = f"""다음 개념에 대한 {duration_days}일 학습 계획을 생성해주세요:

개념: {concept_name}

1. 각 날짜별로 구체적인 학습 활동을 포함해주세요.
2. 이론 학습, 문제 풀이, 복습 등 다양한 학습 활동을 포함해주세요.
3. 학습 목표와 예상 소요 시간을 포함해주세요.

{duration_days}일 학습 계획:"""
        
        # LLM 호출
        return self._generate_completion(prompt)
    
    def get_health_check(self) -> Dict[str, Any]:
        """
        LLM 서비스 상태를 확인합니다.
        
        Returns:
            Dict[str, Any]: 서비스 상태 정보
        """
        try:
            # LM Studio API에 간단한 요청 보내기
            response = requests.get(f"{self.api_url}/models", timeout=5)
            
            if response.status_code == 200:
                return {
                    "status": "online",
                    "api_url": self.api_url,
                    "models": response.json()
                }
            else:
                return {
                    "status": "error",
                    "message": f"API 응답 오류: {response.status_code}",
                    "api_url": self.api_url
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "status": "offline",
                "message": str(e),
                "api_url": self.api_url
            }

# LLM 서비스 팩토리 클래스
class LLMServiceFactory:
    """
    LLM 서비스 인스턴스를 생성하는 팩토리 클래스
    """
    
    @staticmethod
    def create_service(use_mock: bool = False, api_url: str = "http://localhost:1234/v1") -> Any:
        """
        LLM 서비스 인스턴스를 생성합니다.
        
        Args:
            use_mock: 목업 서비스 사용 여부
            api_url: 실제 LLM API URL
            
        Returns:
            Any: LLM 서비스 인스턴스
        """
        if use_mock:
            from services.llm_mock_service import LLMMockService
            return LLMMockService()
        else:
            return LLMService(api_url=api_url)