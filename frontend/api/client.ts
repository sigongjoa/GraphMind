// frontend/api/client.ts
import axios from 'axios';
import llmApi from './llm_client';

export { llmApi };

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

// 기본 데이터 로컬 저장 (API 실패 시 대체)
const localData = {
  concepts: [
    { id: 1, name: '소프트웨어 공학', description: '소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문' },
    { id: 2, name: '요구사항 분석', description: '소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정' },
    { id: 3, name: '유지보수', description: '소프트웨어를 인도한 후에 결함을 수정하고, 성능을 개선하며, 변화된 환경에 적응시키는 과정' },
  ],
  connections: [
    { id: 1, source_id: 2, target_id: 1, relation: '하위 개념', strength: 0.8 },
    { id: 2, source_id: 3, target_id: 1, relation: '하위 개념', strength: 0.7 },
  ],
  cards: [
    { id: 1, concept_id: 1, question: '소프트웨어 공학의 주요 목표는 무엇인가?', answer: '고품질의 소프트웨어를 비용 효율적으로 개발하는 것', explanation: '소프트웨어 공학은 체계적이고 규율적인 접근 방식을 통해 신뢰성 있고 효율적인 소프트웨어를 개발하는 것을 목표로 합니다.' },
    { id: 2, concept_id: 3, question: '유지보수의 4가지 유형은 무엇인가?', answer: '수정 유지보수, 적응 유지보수, 완전 유지보수, 예방 유지보수', explanation: '수정 유지보수는 결함 수정, 적응 유지보수는 환경 변화 대응, 완전 유지보수는 기능 개선, 예방 유지보수는 미래 문제 예방을 위한 것입니다.' },
  ],
  reviews: [
    { id: 1, card_id: 1, difficulty: 3, next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() },
    { id: 2, card_id: 2, difficulty: 4, next_review_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() },
  ],
};

// 로컬 저장소에서 데이터 가져오기/저장하기
const getLocalData = (key) => {
  const stored = localStorage.getItem(`concept-graph-${key}`);
  if (stored) {
    return JSON.parse(stored);
  }
  return localData[key] || [];
};

const setLocalData = (key, data) => {
  localStorage.setItem(`concept-graph-${key}`, JSON.stringify(data));
};

// -----------------------
// 개념 관련 API
// -----------------------
export const conceptsApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/concepts/');
      return response.data;
    } catch (error) {
      console.warn('개념 목록 가져오기 실패, 로컬 데이터 사용:', error);
      return getLocalData('concepts');
    }
  },
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/concepts/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`개념 ID ${id} 가져오기 실패, 로컬 데이터 사용:`, error);
      const concepts = getLocalData('concepts');
      const concept = concepts.find(c => c.id === id);
      
      // 연결 정보 추가
      if (concept) {
        const connections = getLocalData('connections');
        const relatedConnections = connections.filter(c => c.source_id === id || c.target_id === id);
        
        // 관련 개념 정보 구성
        const relatedConcepts = [];
        for (const conn of relatedConnections) {
          const relatedId = conn.source_id === id ? conn.target_id : conn.source_id;
          const relatedConcept = concepts.find(c => c.id === relatedId);
          if (relatedConcept) {
            relatedConcepts.push({
              id: relatedConcept.id,
              name: relatedConcept.name,
              relation: conn.relation
            });
          }
        }
        
        return {
          ...concept,
          related_concepts: relatedConcepts
        };
      }
      
      throw new Error(`개념 ID ${id}를 찾을 수 없습니다.`);
    }
  },
  create: async (data) => {
    try {
      const response = await apiClient.post('/concepts/', data);
      return response.data;
    } catch (error) {
      console.warn('개념 생성 실패, 로컬 데이터에 추가:', error);
      const concepts = getLocalData('concepts');
      const newConcept = {
        id: concepts.length > 0 ? Math.max(...concepts.map(c => c.id)) + 1 : 1,
        name: data.name,
        description: data.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedConcepts = [...concepts, newConcept];
      setLocalData('concepts', updatedConcepts);
      return newConcept;
    }
  },
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/concepts/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`개념 ID ${id} 업데이트 실패, 로컬 데이터 업데이트:`, error);
      const concepts = getLocalData('concepts');
      const updatedConcepts = concepts.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            updated_at: new Date().toISOString()
          };
        }
        return c;
      });
      setLocalData('concepts', updatedConcepts);
      return updatedConcepts.find(c => c.id === id);
    }
  },
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/concepts/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`개념 ID ${id} 삭제 실패, 로컬 데이터에서 삭제:`, error);
      const concepts = getLocalData('concepts');
      const updatedConcepts = concepts.filter(c => c.id !== id);
      setLocalData('concepts', updatedConcepts);
      
      // 관련 연결도 삭제
      const connections = getLocalData('connections');
      const updatedConnections = connections.filter(c => c.source_id !== id && c.target_id !== id);
      setLocalData('connections', updatedConnections);
      
      return { success: true };
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
      console.warn('연결 목록 가져오기 실패, 로컬 데이터 사용:', error);
      return getLocalData('connections');
    }
  },
  getByConceptId: async (conceptId) => {
    try {
      const response = await apiClient.get(`/connections/?source_id=${conceptId}`);
      return response.data;
    } catch (error) {
      console.warn(`개념 ID ${conceptId}의 연결 가져오기 실패, 로컬 데이터 사용:`, error);
      const connections = getLocalData('connections');
      return connections.filter(c => c.source_id === conceptId || c.target_id === conceptId);
    }
  },
  create: async (data) => {
    try {
      const response = await apiClient.post('/connections/', data);
      return response.data;
    } catch (error) {
      console.warn('연결 생성 실패, 로컬 데이터에 추가:', error);
      const connections = getLocalData('connections');
      const newConnection = {
        id: connections.length > 0 ? Math.max(...connections.map(c => c.id)) + 1 : 1,
        source_id: data.source_id,
        target_id: data.target_id,
        relation: data.relation,
        strength: data.strength || 1.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedConnections = [...connections, newConnection];
      setLocalData('connections', updatedConnections);
      return newConnection;
    }
  },
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/connections/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`연결 ID ${id} 삭제 실패, 로컬 데이터에서 삭제:`, error);
      const connections = getLocalData('connections');
      const updatedConnections = connections.filter(c => c.id !== id);
      setLocalData('connections', updatedConnections);
      return { success: true };
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
      console.warn('카드 목록 가져오기 실패, 로컬 데이터 사용:', error);
      let cards = getLocalData('cards');
      
      // 개념별 필터링
      if (conceptId) {
        cards = cards.filter(c => c.concept_id === conceptId);
      }
      
      // 개념 정보 추가
      const concepts = getLocalData('concepts');
      cards = cards.map(card => {
        const concept = concepts.find(c => c.id === card.concept_id);
        return {
          ...card,
          concept: concept ? { id: concept.id, name: concept.name } : null
        };
      });
      
      return cards;
    }
  },
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/cards/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`카드 ID ${id} 가져오기 실패, 로컬 데이터 사용:`, error);
      const cards = getLocalData('cards');
      const card = cards.find(c => c.id === id);
      
      if (card) {
        // 개념 정보 추가
        const concepts = getLocalData('concepts');
        const concept = concepts.find(c => c.id === card.concept_id);
        return {
          ...card,
          concept: concept ? { id: concept.id, name: concept.name } : null
        };
      }
      
      throw new Error(`카드 ID ${id}를 찾을 수 없습니다.`);
    }
  },
  create: async (data) => {
    try {
      const response = await apiClient.post('/cards/', data);
      return response.data;
    } catch (error) {
      console.warn('카드 생성 실패, 로컬 데이터에 추가:', error);
      const cards = getLocalData('cards');
      const newCard = {
        id: cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1,
        concept_id: data.concept_id,
        question: data.question,
        answer: data.answer,
        explanation: data.explanation || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedCards = [...cards, newCard];
      setLocalData('cards', updatedCards);
      
      // 개념 정보 추가
      const concepts = getLocalData('concepts');
      const concept = concepts.find(c => c.id === data.concept_id);
      return {
        ...newCard,
        concept: concept ? { id: concept.id, name: concept.name } : null
      };
    }
  },
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/cards/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`카드 ID ${id} 업데이트 실패, 로컬 데이터 업데이트:`, error);
      const cards = getLocalData('cards');
      const updatedCards = cards.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...(data.question && { question: data.question }),
            ...(data.answer && { answer: data.answer }),
            ...(data.hasOwnProperty('explanation') && { explanation: data.explanation }),
            updated_at: new Date().toISOString()
          };
        }
        return c;
      });
      setLocalData('cards', updatedCards);
      
      const updatedCard = updatedCards.find(c => c.id === id);
      
      // 개념 정보 추가
      if (updatedCard) {
        const concepts = getLocalData('concepts');
        const concept = concepts.find(c => c.id === updatedCard.concept_id);
        return {
          ...updatedCard,
          concept: concept ? { id: concept.id, name: concept.name } : null
        };
      }
      
      return updatedCard;
    }
  },
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/cards/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`카드 ID ${id} 삭제 실패, 로컬 데이터에서 삭제:`, error);
      const cards = getLocalData('cards');
      const updatedCards = cards.filter(c => c.id !== id);
      setLocalData('cards', updatedCards);
      
      // 관련 복습 기록도 삭제
      const reviews = getLocalData('reviews');
      const updatedReviews = reviews.filter(r => r.card_id !== id);
      setLocalData('reviews', updatedReviews);
      
      return { success: true };
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
      console.warn('복습 목록 가져오기 실패, 로컬 데이터 사용:', error);
      let reviews = getLocalData('reviews');
      
      // 카드별 필터링
      if (cardId) {
        reviews = reviews.filter(r => r.card_id === cardId);
      }
      
      return reviews;
    }
  },
  getDueReviews: async () => {
    try {
      const response = await apiClient.get('/reviews/due');
      return response.data;
    } catch (error) {
      console.warn('예정된 복습 목록 가져오기 실패, 로컬 데이터 계산:', error);
      const reviews = getLocalData('reviews');
      const today = new Date();
      
      // 오늘 또는 이전에 복습할 카드
      const dueReviews = reviews.filter(review => {
        const nextReviewDate = new Date(review.next_review_date);
        return nextReviewDate <= today;
      });
      
      return dueReviews;
    }
  },
  create: async (data) => {
    try {
      const response = await apiClient.post('/reviews/', data);
      return response.data;
    } catch (error) {
      console.warn('복습 생성 실패, 로컬 데이터에 추가:', error);
      const reviews = getLocalData('reviews');
      const newReview = {
        id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
        card_id: data.card_id,
        difficulty: data.difficulty,
        next_review_date: data.next_review_date,
        created_at: new Date().toISOString()
      };
      const updatedReviews = [...reviews, newReview];
      setLocalData('reviews', updatedReviews);
      return newReview;
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
      console.warn('학습 통계 가져오기 실패:', error);
      throw error;
    }
  },
  getConceptStats: async (conceptId) => {
    try {
      const response = await apiClient.get(`/stats/concept-stats/${conceptId}`);
      return response.data;
    } catch (error) {
      console.warn(`개념 ID ${conceptId} 통계 가져오기 실패:`, error);
      throw error;
    }
  },
  getReviewStats: async () => {
    try {
      const response = await apiClient.get('/stats/review-stats');
      return response.data;
    } catch (error) {
      console.warn('복습 통계 가져오기 실패:', error);
      throw error;
    }
  },
  getProgressStats: async () => {
    try {
      const response = await apiClient.get('/stats/progress-stats');
      return response.data;
    } catch (error) {
      console.warn('진행 상황 통계 가져오기 실패:', error);
      throw error;
    }
  },
};

export default apiClient;