// frontend/api/llm_client.ts
import axios from 'axios';

// API 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // LLM 응답이 오래 걸릴 수 있으므로 30초로 설정
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

// LLM 서비스 상태 확인
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/llm/health');
    return response.data;
  } catch (error) {
    console.error('LLM 상태 확인 실패:', error);
    return { status: 'error', message: '연결 실패' };
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
    return {
      response: `${concept}은(는) 중요한 개념입니다. (LLM 서비스 연결 오류로 상세 정보를 제공할 수 없습니다.)`
    };
  }
};

// 문제 생성 요청
export const generateQuestion = async (concept: string, difficulty: number = 1) => {
  try {
    const response = await apiClient.post('/llm/generate-question', {
      concept,
      context: null
    }, {
      params: { difficulty }
    });
    return response.data;
  } catch (error) {
    console.error('문제 생성 요청 실패:', error);
    
    // 목업 응답 반환
    return {
      question: `${concept}의 주요 특징은 무엇인가요?`,
      answer: `${concept}의 주요 특징은 다양한 환경에서의 적용 가능성, 확장성 등이 있습니다.`,
      explanation: `이 문제는 ${concept}의 기본적인 특징에 대한 이해를 묻는 문제입니다. (LLM 서비스 연결 오류로 상세 정보를 제공할 수 없습니다.)`
    };
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
    return {
      concepts: [
        {name: `${concept}의 기초`, relation: "선행 개념"},
        {name: `${concept}의 응용`, relation: "후행 개념"},
        {name: `${concept}의 유사 개념`, relation: "유사 개념"}
      ]
    };
  }
};

// 대화형 응답 요청 (채팅)
export const getResponse = async (message: string, concept: string) => {
  try {
    const response = await apiClient.post('/llm/explain', {
      concept,
      context: message
    });
    return response.data;
  } catch (error) {
    console.error('대화형 응답 요청 실패:', error);
    
    
    // 간단한 목업 응답 생성
    return {
      response: `"${message}"에 대한 응답입니다. 현재 LLM 서비스와 연결이 원활하지 않아 자세한 답변을 드릴 수 없습니다.`
    };
  }
};

export default {
  checkHealth,
  explainConcept,
  generateQuestion,
  suggestConcepts,
  getResponse
};