// frontend/api/llm_client.ts
import axios from 'axios';

// API 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 에러 인터셉터 추가
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('LLM API 요청 오류:', error);
    
    // 사용자 친화적인 오류 메시지
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('LLM 서버 응답 시간이 초과되었습니다. 다시 시도해 주세요.'));
    }
    
    if (!error.response) {
      return Promise.reject(new Error('LLM 서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.'));
    }
    
    return Promise.reject(error);
  }
);

// 기본 목업 응답 (LLM API 실패 시 대체)
const mockResponses = {
  explanations: {
    "소프트웨어 공학": "소프트웨어 공학은 소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문입니다. 고품질의 소프트웨어를 비용 효율적으로 개발하는 것을 목표로 합니다.",
    "요구사항 분석": "요구사항 분석은 소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정입니다. 사용자의 요구를 파악하고 이를 명확하게 정의하여 개발 과정의 기초를 마련합니다.",
    "알고리즘": "알고리즘은 문제를 해결하기 위한 명확하게 정의된 일련의 단계적 절차입니다. 입력을 받아 출력을 생성하는 과정을 명시합니다.",
    "데이터 구조": "데이터 구조는 데이터를 효율적으로 저장, 조직, 관리하기 위한 특별한 형식입니다. 배열, 연결 리스트, 스택, 큐, 트리, 그래프 등이 대표적인 데이터 구조입니다."
  },
  questions: {
    "소프트웨어 공학": {
      question: "소프트웨어 개발 생명주기(SDLC)의 주요 단계를 나열하시오.",
      answer: "요구사항 분석, 설계, 구현, 테스트, 배포, 유지보수",
      explanation: "소프트웨어 개발 생명주기는 소프트웨어 개발 과정을 체계적으로 관리하기 위한 프레임워크입니다. 각 단계는 특정 활동과 산출물을 포함합니다."
    },
    "요구사항 분석": {
      question: "기능적 요구사항과 비기능적 요구사항의 차이점은 무엇인가?",
      answer: "기능적 요구사항은 시스템이 수행해야 할 기능을 명시하고, 비기능적 요구사항은 성능, 보안, 사용성 등 시스템의 품질 속성을 명시한다.",
      explanation: "기능적 요구사항은 '무엇을 할 것인가'에 초점을 맞추고, 비기능적 요구사항은 '어떻게 할 것인가'에 초점을 맞춥니다."
    },
    "알고리즘": {
      question: "시간 복잡도가 O(n log n)인 정렬 알고리즘은 무엇인가?",
      answer: "퀵 정렬, 합병 정렬, 힙 정렬",
      explanation: "이러한 정렬 알고리즘들은 평균적으로 O(n log n)의 시간 복잡도를 가지며, 대용량 데이터 처리에 효율적입니다."
    }
  },
  suggestedConcepts: {
    "소프트웨어 공학": [
      {name: "요구사항 분석", relation: "하위 개념"},
      {name: "소프트웨어 설계", relation: "하위 개념"},
      {name: "소프트웨어 테스팅", relation: "하위 개념"},
      {name: "유지보수", relation: "하위 개념"}
    ],
    "요구사항 분석": [
      {name: "소프트웨어 공학", relation: "상위 개념"},
      {name: "유스케이스", relation: "관련 기법"},
      {name: "요구사항 명세서", relation: "산출물"}
    ],
    "알고리즘": [
      {name: "시간 복잡도", relation: "분석 지표"},
      {name: "정렬 알고리즘", relation: "하위 개념"},
      {name: "탐색 알고리즘", relation: "하위 개념"},
      {name: "그래프 알고리즘", relation: "하위 개념"}
    ]
  }
};

// 개념 설명 요청
export const explainConcept = async (concept: string, context?: string) => {
  try {
    const response = await apiClient.post('/llm/explain', {
      concept,
      context
    });
    return response.data;
  } catch (error) {
    console.error('개념 설명 요청 실패:', error);
    
    // 목업 응답 반환
    const mockExplanation = mockResponses.explanations[concept] || 
      `${concept}은(는) 중요한 개념입니다. 이에 대한 자세한 설명은 아직 준비되지 않았습니다.`;
    
    return {
      response: mockExplanation
    };
  }
};

// 문제 생성 요청
export const generateQuestion = async (concept: string, difficulty: number = 1) => {
  try {
    const response = await apiClient.post('/llm/generate-question', {
      concept,
      difficulty
    });
    return response.data;
  } catch (error) {
    console.error('문제 생성 요청 실패:', error);
    
    // 목업 응답 반환
    const mockQuestion = mockResponses.questions[concept] || {
      question: `${concept}의 주요 특징은 무엇인가요?`,
      answer: `${concept}의 주요 특징은 확장성, 유연성입니다.`,
      explanation: `${concept}은(는) 다양한 상황에 적용할 수 있는 개념입니다.`
    };
    
    return mockQuestion;
  }
};

// 관련 개념 추천 요청
export const suggestConcepts = async (concept: string) => {
  try {
    const response = await apiClient.post('/llm/suggest-concepts', {
      concept,
      context: null
    });
    return response.data;
  } catch (error) {
    console.error('관련 개념 추천 요청 실패:', error);
    
    // 목업 응답 반환
    const mockSuggestions = mockResponses.suggestedConcepts[concept] || [
      {name: `${concept} 기초`, relation: "선행 개념"},
      {name: `${concept} 응용`, relation: "후행 개념"},
      {name: `${concept} 사례`, relation: "관련 개념"}
    ];
    
    return {
      concepts: mockSuggestions
    };
  }
};

// 대화형 응답 요청
export const getResponse = async (message: string, history: any[] = []) => {
  try {
    const response = await apiClient.post('/llm/chat', {
      message,
      history
    });
    return response.data;
  } catch (error) {
    console.error('대화형 응답 요청 실패:', error);
    
    // 간단한 목업 응답 생성
    return {
      response: `"${message}"에 대한 응답입니다. LLM 서비스가 현재 연결되지 않아 자세한 응답을 제공할 수 없습니다.`
    };
  }
};

export default {
  explainConcept,
  generateQuestion,
  suggestConcepts,
  getResponse
};