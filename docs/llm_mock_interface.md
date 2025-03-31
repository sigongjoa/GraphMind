# 개념 그래프 기반 학습 시스템 - LLM 목업 인터페이스 설계

## 1. LLM 목업 개요

개념 그래프 기반 학습 시스템에서 LLM(Large Language Model) 서비스는 다음과 같은 핵심 기능을 제공합니다:

1. 개념 설명 생성
2. 학습 문제 생성
3. 관련 개념 추천

실제 LLM 연동 대신 미리 정의된 응답을 반환하는 목업 서비스를 구현하여 프론트엔드 개발 및 테스트를 지원합니다.

## 2. LLM 목업 인터페이스

### 2.1 목업 서비스 구조

```python
# llm_mock_service.py
from typing import List, Dict, Any, Optional
import json
import random
from datetime import datetime

class LLMMockService:
    """
    LLM 서비스를 목업으로 구현한 클래스
    """
    
    def __init__(self):
        """
        사전 정의된 응답 데이터를 로드합니다.
        """
        self.concept_explanations = self._load_concept_explanations()
        self.question_templates = self._load_question_templates()
        self.related_concepts = self._load_related_concepts()
    
    def _load_concept_explanations(self) -> Dict[str, str]:
        """
        개념 설명 데이터를 로드합니다.
        """
        return {
            "소프트웨어 공학": "소프트웨어 공학은 소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문입니다. 고품질의 소프트웨어를 비용 효율적으로 개발하는 것을 목표로 합니다.",
            "요구사항 분석": "요구사항 분석은 소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정입니다. 사용자의 요구를 파악하고 이를 명확하게 정의하여 개발 과정의 기초를 마련합니다.",
            "유지보수": "유지보수는 소프트웨어를 인도한 후에 결함을 수정하고, 성능을 개선하며, 변화된 환경에 적응시키는 과정입니다. 수정 유지보수, 적응 유지보수, 완전 유지보수, 예방 유지보수의 네 가지 유형이 있습니다.",
            "집합론": "집합론은 수학의 기초 분야로, 집합이라는 개념과 그 연산에 대해 연구하는 학문입니다. 집합은 잘 정의된 대상들의 모임을 의미합니다.",
            "부분집합": "부분집합은 어떤 집합의 모든 원소가 다른 집합에 포함되는 관계를 말합니다. A가 B의 부분집합이라면, A의 모든 원소는 B에도 속합니다.",
            "파워셋": "파워셋은 어떤 집합의 모든 부분집합을 원소로 하는 집합입니다. 집합 S의 파워셋은 P(S)로 표기하며, 원소의 개수가 n인 집합의 파워셋은 2^n개의 원소를 갖습니다.",
            "카디널리티": "카디널리티는 집합의 크기 또는 원소의 개수를 의미합니다. 유한 집합의 경우 원소의 개수를 세어 결정하며, 무한 집합의 경우 더 복잡한 개념이 적용됩니다.",
            "알고리즘": "알고리즘은 문제를 해결하기 위한 명확하게 정의된 일련의 단계적 절차입니다. 입력을 받아 출력을 생성하는 과정을 명시합니다.",
            "자료구조": "자료구조는 데이터를 효율적으로 저장, 조직, 관리하기 위한 특별한 형식입니다. 배열, 연결 리스트, 스택, 큐, 트리, 그래프 등이 대표적인 자료구조입니다.",
            "객체지향 프로그래밍": "객체지향 프로그래밍은 데이터와 해당 데이터를 처리하는 메서드를 하나의 객체로 묶는 프로그래밍 패러다임입니다. 캡슐화, 상속, 다형성, 추상화가 주요 특징입니다."
        }
    
    def _load_question_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        문제 템플릿 데이터를 로드합니다.
        """
        return {
            "소프트웨어 공학": [
                {
                    "question": "소프트웨어 공학의 주요 목표는 무엇인가?",
                    "answer": "고품질의 소프트웨어를 비용 효율적으로 개발하는 것",
                    "explanation": "소프트웨어 공학은 체계적이고 규율적인 접근 방식을 통해 신뢰성 있고 효율적인 소프트웨어를 개발하는 것을 목표로 합니다."
                },
                {
                    "question": "소프트웨어 개발 생명주기(SDLC)의 주요 단계를 나열하시오.",
                    "answer": "요구사항 분석, 설계, 구현, 테스트, 배포, 유지보수",
                    "explanation": "소프트웨어 개발 생명주기는 소프트웨어 개발 과정을 체계적으로 관리하기 위한 프레임워크입니다. 각 단계는 특정 활동과 산출물을 포함합니다."
                }
            ],
            "요구사항 분석": [
                {
                    "question": "요구사항 분석의 주요 목적은 무엇인가?",
                    "answer": "사용자의 요구를 파악하고 이를 명확하게 정의하여 개발 과정의 기초를 마련하는 것",
                    "explanation": "요구사항 분석은 소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정으로, 개발 과정의 방향을 설정합니다."
                },
                {
                    "question": "기능적 요구사항과 비기능적 요구사항의 차이점은 무엇인가?",
                    "answer": "기능적 요구사항은 시스템이 수행해야 할 기능을 명시하고, 비기능적 요구사항은 성능, 보안, 사용성 등 시스템의 품질 속성을 명시한다.",
                    "explanation": "기능적 요구사항은 '무엇을 할 것인가'에 초점을 맞추고, 비기능적 요구사항은 '어떻게 할 것인가'에 초점을 맞춥니다."
                }
            ],
            "유지보수": [
                {
                    "question": "유지보수의 4가지 유형은 무엇인가?",
                    "answer": "수정 유지보수, 적응 유지보수, 완전 유지보수, 예방 유지보수",
                    "explanation": "수정 유지보수는 결함 수정, 적응 유지보수는 환경 변화 대응, 완전 유지보수는 기능 개선, 예방 유지보수는 미래 문제 예방을 위한 것입니다."
                },
                {
                    "question": "유지보수가 소프트웨어 개발 비용에서 차지하는 비중은 일반적으로 얼마인가?",
                    "answer": "약 60-80%",
                    "explanation": "소프트웨어의 전체 생명주기 비용 중 유지보수 비용이 가장 큰 비중을 차지하며, 이는 소프트웨어가 오랜 기간 사용되고 지속적으로 변경되기 때문입니다."
                }
            ],
            "집합론": [
                {
                    "question": "집합의 정의는 무엇인가?",
                    "answer": "잘 정의된 대상들의 모임",
                    "explanation": "집합은 명확한 기준에 따라 어떤 대상이 집합에 속하는지 아닌지 결정할 수 있어야 합니다."
                },
                {
                    "question": "공집합의 의미와 표기법은?",
                    "answer": "원소가 하나도 없는 집합으로, ∅ 또는 {}로 표기한다.",
                    "explanation": "공집합은 모든 집합의 부분집합이며, 유일하게 존재합니다."
                }
            ],
            "부분집합": [
                {
                    "question": "집합 A가 집합 B의 부분집합임을 표현하는 기호는?",
                    "answer": "A ⊆ B",
                    "explanation": "A가 B의 부분집합이라는 것은 A의 모든 원소가 B에도 속한다는 의미입니다."
                },
                {
                    "question": "집합 A = {1, 2, 3}의 모든 부분집합을 나열하시오.",
                    "answer": "{}, {1}, {2}, {3}, {1, 2}, {1, 3}, {2, 3}, {1, 2, 3}",
                    "explanation": "원소가 n개인 집합의 부분집합의 개수는 2^n개입니다. 따라서 A의 부분집합은 2^3 = 8개입니다."
                }
            ],
            "파워셋": [
                {
                    "question": "집합 S = {a, b}의 파워셋 P(S)는?",
                    "answer": "P(S) = {{}, {a}, {b}, {a, b}}",
                    "explanation": "파워셋은 주어진 집합의 모든 부분집합을 원소로 하는 집합입니다."
                },
                {
                    "question": "원소가 n개인 집합의 파워셋의 원소 개수는?",
                    "answer": "2^n",
                    "explanation": "각 원소는 부분집합에 포함되거나 포함되지 않는 두 가지 경우가 있으므로, 총 경우의 수는 2^n입니다."
                }
            ],
            "카디널리티": [
                {
                    "question": "집합 A = {1, 2, 3, 4, 5}의 카디널리티는?",
                    "answer": "5",
                    "explanation": "카디널리티는 집합의 원소 개수를 의미합니다."
                },
                {
                    "question": "두 집합 A와 B의 합집합의 카디널리티를 구하는 공식은?",
                    "answer": "|A ∪ B| = |A| + |B| - |A ∩ B|",
                    "explanation": "이 공식은 포함-배제 원리의 기본 형태로, 두 집합의 원소 개수를 더한 후 중복 계산된 교집합의 원소 개수를 빼는 방식입니다."
                }
            ],
            "알고리즘": [
                {
                    "question": "알고리즘의 시간 복잡도를 표현하는 일반적인 표기법은?",
                    "answer": "빅오 표기법(Big O Notation)",
                    "explanation": "빅오 표기법은 알고리즘의 최악의 경우 실행 시간의 상한을 나타냅니다."
                },
                {
                    "question": "퀵 정렬 알고리즘의 평균 시간 복잡도는?",
                    "answer": "O(n log n)",
                    "explanation": "퀵 정렬은 분할 정복 방식을 사용하며, 평균적으로 효율적인 정렬 알고리즘입니다. 최악의 경우 O(n²)의 시간 복잡도를 가집니다."
                }
            ],
            "자료구조": [
                {
                    "question": "스택의 주요 연산과 특징은?",
                    "answer": "주요 연산: push(삽입), pop(제거). 특징: LIFO(Last In First Out) 구조",
                    "explanation": "스택은 가장 최근에 추가된 항목이 가장 먼저 제거되는 자료구조입니다."
                },
                {
                    "question": "이진 탐색 트리에서 검색, 삽입, 삭제 연산의 평균 시간 복잡도는?",
                    "answer": "O(log n)",
                    "explanation": "균형 잡힌 이진 탐색 트리에서는 각 연산이 트리의 높이에 비례하는 시간이 소요됩니다."
                }
            ],
            "객체지향 프로그래밍": [
                {
                    "question": "객체지향 프로그래밍의 4가지 주요 특징은?",
                    "answer": "캡슐화, 상속, 다형성, 추상화",
                    "explanation": "이러한 특징들은 코드의 재사용성, 유지보수성, 확장성을 향상시킵니다."
                },
                {
                    "question": "다형성의 의미와 장점은?",
                    "answer": "다형성은 같은 인터페이스를 통해 다양한 객체 타입에 접근할 수 있는 능력으로, 코드의 유연성과 확장성을 높인다.",
                    "explanation": "다형성을 통해 새로운 클래스를 추가할 때 기존 코드를 수정하지 않고도 시스템을 확장할 수 있습니다."
                }
            ]
        }
    
    def _load_related_concepts(self) -> Dict[int, List[Dict[str, Any]]]:
        """
        관련 개념 데이터를 로드합니다.
        """
        return {
            1: [  # 소프트웨어 공학
                {"id": 2, "name": "요구사항 분석", "relation": "하위 개념"},
                {"id": 3, "name": "유지보수", "relation": "하위 개념"},
                {"id": 11, "name": "소프트웨어 테스팅", "relation": "하위 개념"},
                {"id": 12, "name": "소프트웨어 설계", "relation": "하위 개념"}
            ],
            2: [  # 요구사항 분석
                {"id": 1, "name": "소프트웨어 공학", "relation": "상위 개념"},
                {"id": 13, "name": "요구공학", "relation": "상위 개념"},
                {"id": 14, "name": "유스케이스", "relation": "관련 기법"}
            ],
            3: [  # 유지보수
                {"id": 1, "name": "소프트웨어 공학", "relation": "상위 개념"},
                {"id": 15, "name": "리팩토링", "relation": "관련 기법"},
                {"id": 16, "name": "버전 관리", "relation": "관련 도구"}
            ],
            4: [  # 집합론
                {"id": 5, "name": "부분집합", "relation": "하위 개념"},
                {"id": 6, "name": "파워셋", "relation": "하위 개념"},
                {"id": 7, "name": "카디널리티", "relation": "하위 개념"},
                {"id": 17, "name": "수학적 논리", "relation": "관련 분야"}
            ],
            5: [  # 부분집합
                {"id": 4, "name": "집합론", "relation": "상위 개념"},
                {"id": 6, "name": "파워셋", "relation": "관련 개념"},
                {"id": 18, "name": "포함 관계", "relation": "관련 개념"}
            ],
            6: [  # 파워셋
                {"id": 4, "name": "집합론", "relation": "상위 개념"},
                {"id": 5, "name": "부분집합", "relation": "관련 개념"},
                {"id": 7, "name": "카디널리티", "relation": "관련 개념"}
            ],
            7: [  # 카디널리티
                {"id": 4, "name": "집합론", "relation": "상위 개념"},
                {"id": 19, "name": "무한 집합", "relation": "관련 개념"},
                {"id": 20, "name": "계수", "relation": "관련 개념"}
            ],
            8: [  # 알고리즘
                {"id": 9, "name": "자료구조", "relation": "관련 분야"},
                {"id": 21, "name": "시간 복잡도", "relation": "하위 개념"},
                {"id": 22, "name": "정렬 알고리즘", "relation": "하위 개념"}
            ],
            9: [  # 자료구조
                {"id": 8, "name": "알고리즘", "relation": "관련 분야"},
                {"id": 23, "name": "배열", "relation": "하위 개념"},
                {"id": 24, "name": "연결 리스트", "relation": "하위 개념"},
                {"id": 25, "name": "트리", "relation": "하위 개념"}
            ],
            10: [  # 객체지향 프로그래밍
                {"id": 26, "name": "클래스", "relation": "하위 개념"},
                {"id": 27, "name": "상속", "relation": "하위 개념"},
                {"id": 28, "name": "다형성", "relation": "하위 개념"},
                {"id": 29, "name": "캡슐화", "relation": "하위 개념"}
            ]
        }
    
    def explain_concept(self, concept_name: str) -> str:
        """
        개념에 대한 설명을 제공합니다.
        
        Args:
            concept_name: 설명을 요청할 개념 이름
            
        Returns:
            str: 개념 설명
        """
        if concept_name in self.concept_explanations:
            return self.concept_explanations[concept_name]
        else:
            return f"'{concept_name}'에 대한 설명을 찾을 수 없습니다."
    
    def generate_question(self, concept_id: int, difficulty: int = 1) -> Dict[str, str]:
        """
        개념에 대한 학습 문제를 생성합니다.
        
        Args:
            concept_id: 문제를 생성할 개념 ID
            difficulty: 문제 난이도 (1-5)
            
        Returns:
            Dict[str, str]: 문제, 답변, 설명을 포함한 딕셔너리
        """
        # 개념 ID를 개념 이름으로 매핑 (실제 구현에서는 DB 조회)
        concept_map = {
            1: "소프트웨어 공학",
            2: "요구사항 분석",
            3: "유지보수",
            4: "집합론",
            5: "부분집합",
            6: "파워셋",
            7: "카디널리티",
            8: "알고리즘",
            9: "자료구조",
            10: "객체지향 프로그래밍"
        }
        
        concept_name = concept_map.get(concept_id, "알 수 없는 개념")
        
        if concept_name in self.question_templates:
            questions = self.question_templates[concept_name]
            if questions:
                # 난이도에 따라 문제 선택 (목업에서는 무작위 선택)
                question = random.choice(questions)
                return question
        
        # 기본 응답
        return {
            "question": f"{concept_name}에 대해 설명하시오.",
            "answer": f"{concept_name}은(는) 중요한 개념입니다.",
            "explanation": "이 문제는 기본적인 개념 이해를 테스트합니다."
        }
    
    def recommend_related_concepts(self, concept_id: int) -> List[Dict[str, Any]]:
        """
        관련 개념을 추천합니다.
        
        Args:
            concept_id: 관련 개념을 추천할 개념 ID
            
        Returns:
            List[Dict[str, Any]]: 관련 개념 목록
        """
        if concept_id in self.related_concepts:
            return self.related_concepts[concept_id]
        else:
            return []
```

### 2.2 LLM 목업 API 구현

```python
# llm_mock_api.py
from fastapi import APIRouter, HTTPException
from typing import List

from schemas import (
    ExplainRequest, ExplainResponse,
    GenerateQuestionRequest, GenerateQuestionResponse,
    RecommendConceptsRequest, RecommendConceptsResponse,
    RelatedConcept
)
from services.llm_mock_service import LLMMockService

router = APIRouter()
llm_service = LLMMockService()

@router.post("/explain", response_model=ExplainResponse)
async def explain_concept(request: ExplainRequest):
    """
    개념에 대한 설명을 제공합니다.
    """
    explanation = llm_service.explain_concept(request.concept_name)
    return ExplainResponse(explanation=explanation)

@router.post("/generate-question", response_model=GenerateQuestionResponse)
async def generate_question(request: GenerateQuestionRequest):
    """
    개념에 대한 학습 문제를 생성합니다.
    """
    result = llm_service.generate_question(request.concept_id, request.difficulty)
    return GenerateQuestionResponse(
        question=result["question"],
        answer=result["answer"],
        explanation=result.get("explanation", "")
    )

@router.post("/recommend-concepts", response_model=RecommendConceptsResponse)
async def recommend_concepts(request: RecommendConceptsRequest):
    """
    관련 개념을 추천합니다.
    """
    related = llm_service.recommend_related_concepts(request.concept_id)
    related_concepts = [
        RelatedConcept(id=item["id"], name=item["name"], relation=item["relation"])
        for item in related
    ]
    return RecommendConceptsResponse(related_concepts=related_concepts)
```

## 3. 목업 데이터 예시

### 3.1 개념 설명 예시

```json
{
  "소프트웨어 공학": "소프트웨어 공학은 소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문입니다. 고품질의 소프트웨어를 비용 효율적으로 개발하는 것을 목표로 합니다.",
  "요구사항 분석": "요구사항 분석은 소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정입니다. 사용자의 요구를 파악하고 이를 명확하게 정의하여 개발 과정의 기초를 마련합니다."
}
```

### 3.2 문제 생성 예시

```json
{
  "question": "소프트웨어 공학의 주요 목표는 무엇인가?",
  "answer": "고품질의 소프트웨어를 비용 효율적으로 개발하는 것",
  "explanation": "소프트웨어 공학은 체계적이고 규율적인 접근 방식을 통해 신뢰성 있고 효율적인 소프트웨어를 개발하는 것을 목표로 합니다."
}
```

### 3.3 관련 개념 추천 예시

```json
{
  "related_concepts": [
    {
      "id": 2,
      "name": "요구사항 분석",
      "relation": "하위 개념"
    },
    {
      "id": 3,
      "name": "유지보수",
      "relation": "하위 개념"
    },
    {
      "id": 11,
      "name": "소프트웨어 테스팅",
      "relation": "하위 개념"
    },
    {
      "id": 12,
      "name": "소프트웨어 설계",
      "relation": "하위 개념"
    }
  ]
}
```

## 4. 실제 LLM 연동 계획

목업 서비스는 개발 및 테스트 단계에서 사용되며, 실제 서비스에서는 다음과 같은 방식으로 LLM을 연동할 수 있습니다:

### 4.1 로컬 LLM 연동 (LM Studio)

```python
# llm_service.py (실제 구현 예시)
import requests
from typing import Dict, Any, List

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
    
    def _generate_completion(self, prompt: str) -> str:
        """
        LLM에 프롬프트를 전송하고 응답을 받습니다.
        
        Args:
            prompt: LLM에 전송할 프롬프트
            
        Returns:
            str: LLM의 응답
        """
        response = requests.post(
            f"{self.api_url}/chat/completions",
            json={
                "model": "local-model",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7
            }
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            return f"Error: {response.status_code}, {response.text}"
    
    def explain_concept(self, concept_name: str) -> str:
        """
        개념에 대한 설명을 제공합니다.
        
        Args:
            concept_name: 설명을 요청할 개념 이름
            
        Returns:
            str: 개념 설명
        """
        prompt = f"""
        다음 개념에 대해 자세히 설명해주세요:
        
        개념: {concept_name}
        
        설명:
        """
        
        return self._generate_completion(prompt)
    
    def generate_question(self, concept_name: str, difficulty: int = 1) -> Dict[str, str]:
        """
        개념에 대한 학습 문제를 생성합니다.
        
        Args:
            concept_name: 문제를 생성할 개념 이름
            difficulty: 문제 난이도 (1-5)
            
        Returns:
            Dict[str, str]: 문제, 답변, 설명을 포함한 딕셔너리
        """
        prompt = f"""
        다음 개념에 대한 학습 문제를 생성해주세요:
        
        개념: {concept_name}
        난이도: {difficulty} (1-5)
        
        다음 JSON 형식으로 응답해주세요:
        {{
          "question": "문제 내용",
          "answer": "정답",
          "explanation": "해설"
        }}
        """
        
        response = self._generate_completion(prompt)
        
        try:
            # JSON 형식 추출 (실제 구현에서는 더 견고한 파싱 필요)
            import json
            return json.loads(response)
        except:
            # 파싱 실패 시 기본 응답
            return {
                "question": f"{concept_name}에 대해 설명하시오.",
                "answer": f"{concept_name}은(는) 중요한 개념입니다.",
                "explanation": "이 문제는 기본적인 개념 이해를 테스트합니다."
            }
    
    def recommend_related_concepts(self, concept_name: str) -> List[Dict[str, Any]]:
        """
        관련 개념을 추천합니다.
        
        Args:
            concept_name: 관련 개념을 추천할 개념 이름
            
        Returns:
            List[Dict[str, Any]]: 관련 개념 목록
        """
        prompt = f"""
        다음 개념과 관련된 개념들을 추천해주세요:
        
        개념: {concept_name}
        
        다음 JSON 형식으로 응답해주세요:
        {{
          "related_concepts": [
            {{"name": "관련 개념 1", "relation": "관계 설명"}},
            {{"name": "관련 개념 2", "relation": "관계 설명"}},
            ...
          ]
        }}
        """
        
        response = self._generate_completion(prompt)
        
        try:
            # JSON 형식 추출 (실제 구현에서는 더 견고한 파싱 필요)
            import json
            result = json.loads(response)
            return result.get("related_concepts", [])
        except:
            # 파싱 실패 시 빈 목록 반환
            return []
```

## 5. 목업과 실제 LLM 연동 간 전환

개발 환경과 프로덕션 환경에서 목업과 실제 LLM 서비스 간 전환을 위한 팩토리 패턴 구현:

```python
# llm_factory.py
from typing import Union
from services.llm_mock_service import LLMMockService
from services.llm_service import LLMService

class LLMFactory:
    """
    LLM 서비스 팩토리 클래스
    """
    
    @staticmethod
    def create_service(use_mock: bool = True, api_url: str = "http://localhost:1234/v1") -> Union[LLMMockService, LLMService]:
        """
        LLM 서비스 인스턴스를 생성합니다.
        
        Args:
            use_mock: 목업 서비스 사용 여부
            api_url: 실제 LLM API URL
            
        Returns:
            Union[LLMMockService, LLMService]: LLM 서비스 인스턴스
        """
        if use_mock:
            return LLMMockService()
        else:
            return LLMService(api_url=api_url)
```

## 6. 설정 및 환경 변수

```python
# config.py
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    """
    애플리케이션 설정
    """
    # LLM 서비스 설정
    USE_MOCK_LLM: bool = os.getenv("USE_MOCK_LLM", "true").lower() == "true"
    LLM_API_URL: str = os.getenv("LLM_API_URL", "http://localhost:1234/v1")
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 7. 의존성 주입 설정

```python
# dependencies.py
from fastapi import Depends
from services.llm_factory import LLMFactory
from config import settings

def get_llm_service():
    """
    LLM 서비스 의존성 주입
    """
    return LLMFactory.create_service(
        use_mock=settings.USE_MOCK_LLM,
        api_url=settings.LLM_API_URL
    )
```
