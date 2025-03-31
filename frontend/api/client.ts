// 프론트엔드 API 클라이언트: api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 개념 관련 API
export const conceptsApi = {
  getAll: async () => {
    const response = await apiClient.get('/concepts/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/concepts/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/concepts/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/concepts/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/concepts/${id}`);
    return response.data;
  },
};

// 연결 관련 API
export const connectionsApi = {
  getAll: async () => {
    const response = await apiClient.get('/connections/');
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/connections/', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/connections/${id}`);
    return response.data;
  },
};

// 카드 관련 API
export const cardsApi = {
  getAll: async (conceptId?: number) => {
    const url = conceptId ? `/cards/?concept_id=${conceptId}` : '/cards/';
    const response = await apiClient.get(url);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/cards/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/cards/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/cards/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/cards/${id}`);
    return response.data;
  },
};

// 복습 관련 API
export const reviewsApi = {
  getAll: async (cardId?: number) => {
    const url = cardId ? `/reviews/?card_id=${cardId}` : '/reviews/';
    const response = await apiClient.get(url);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/reviews/', data);
    return response.data;
  },
};

// 노트 관련 API
export const notesApi = {
  getAll: async (conceptId?: number) => {
    const url = conceptId ? `/notes/?concept_id=${conceptId}` : '/notes/';
    const response = await apiClient.get(url);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/notes/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/notes/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/notes/${id}`);
    return response.data;
  },
};

// LLM 통합 API
export const llmApi = {
  explainConcept: async (concept: string, context?: string) => {
    const response = await apiClient.post('/llm/explain', { concept, context });
    return response.data;
  },
  generateQuestion: async (concept: string, context?: string) => {
    const response = await apiClient.post('/llm/generate-question', { concept, context });
    return response.data;
  },
  suggestConcepts: async (concept: string, context?: string) => {
    const response = await apiClient.post('/llm/suggest-concepts', { concept, context });
    return response.data;
  },
};

export default apiClient;
