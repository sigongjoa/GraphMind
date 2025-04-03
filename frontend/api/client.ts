// frontend/api/client.ts
import axios from 'axios';

// API 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // 타임아웃 설정
  timeout: 10000,
});

// 에러 인터셉터 추가
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API 요청 오류:', error);
    
    // 사용자 친화적인 오류 메시지
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('서버 응답 시간이 초과되었습니다. 다시 시도해 주세요.'));
    }
    
    if (!error.response) {
      return Promise.reject(new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.'));
    }
    
    return Promise.reject(error);
  }
);

// -----------------------
// 개념 관련 API
// -----------------------
export const conceptsApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/concepts/');
      return response.data;
    } catch (error) {
      console.error('개념 목록 가져오기 실패:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/concepts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`개념 ID ${id} 가져오기 실패:`, error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await apiClient.post('/concepts/', data);
      return response.data;
    } catch (error) {
      console.error('개념 생성 실패:', error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/concepts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`개념 ID ${id} 업데이트 실패:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/concepts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`개념 ID ${id} 삭제 실패:`, error);
      throw error;
    }
  },
};

// -----------------------
// 연결 관련 API
// -----------------------
export const connectionsApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/connections/');
      return response.data;
    } catch (error) {
      console.error('연결 목록 가져오기 실패:', error);
      throw error;
    }
  },
  getByConceptId: async (conceptId) => {
    try {
      const response = await apiClient.get(`/concepts/${conceptId}/connections`);
      return response.data;
    } catch (error) {
      console.error(`개념 ID ${conceptId}의 연결 가져오기 실패:`, error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await apiClient.post('/connections/', data);
      return response.data;
    } catch (error) {
      console.error('연결 생성 실패:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/connections/${id}`);
      return response.data;
    } catch (error) {
      console.error(`연결 ID ${id} 삭제 실패:`, error);
      throw error;
    }
  },
};

// -----------------------
// 카드 관련 API
// -----------------------
export const cardsApi = {
  getAll: async (conceptId) => {
    try {
      const url = conceptId ? `/cards/?concept_id=${conceptId}` : '/cards/';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('카드 목록 가져오기 실패:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/cards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`카드 ID ${id} 가져오기 실패:`, error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await apiClient.post('/cards/', data);
      return response.data;
    } catch (error) {
      console.error('카드 생성 실패:', error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/cards/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`카드 ID ${id} 업데이트 실패:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/cards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`카드 ID ${id} 삭제 실패:`, error);
      throw error;
    }
  },
};

// -----------------------
// 복습 관련 API
// -----------------------
export const reviewsApi = {
  getAll: async (cardId) => {
    try {
      const url = cardId ? `/reviews/?card_id=${cardId}` : '/reviews/';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('복습 목록 가져오기 실패:', error);
      throw error;
    }
  },
  getDueReviews: async () => {
    try {
      const response = await apiClient.get('/reviews/due');
      return response.data;
    } catch (error) {
      console.error('예정된 복습 목록 가져오기 실패:', error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      const response = await apiClient.post('/reviews/', data);
      return response.data;
    } catch (error) {
      console.error('복습 생성 실패:', error);
      throw error;
    }
  },
};

// -----------------------
// 통계 관련 API
// -----------------------
export const statsApi = {
  getLearningStats: async () => {
    try {
      const response = await apiClient.get('/stats/learning-stats');
      return response.data;
    } catch (error) {
      console.error('학습 통계 가져오기 실패:', error);
      throw error;
    }
  },
  getConceptStats: async (conceptId) => {
    try {
      const response = await apiClient.get(`/stats/concept-stats/${conceptId}`);
      return response.data;
    } catch (error) {
      console.error(`개념 ID ${conceptId} 통계 가져오기 실패:`, error);
      throw error;
    }
  },
  getReviewStats: async () => {
    try {
      const response = await apiClient.get('/stats/review-stats');
      return response.data;
    } catch (error) {
      console.error('복습 통계 가져오기 실패:', error);
      throw error;
    }
  },
  getProgressStats: async () => {
    try {
      const response = await apiClient.get('/stats/progress-stats');
      return response.data;
    } catch (error) {
      console.error('진행 상황 통계 가져오기 실패:', error);
      throw error;
    }
  },
};

export default apiClient;