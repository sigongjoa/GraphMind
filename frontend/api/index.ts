// frontend/api/index.ts
import apiClient from './client';
import { conceptsApi, connectionsApi, cardsApi, reviewsApi, notesApi, statsApi } from './client';
import llmApi from './llm_client';

// API 인스턴스 익스포트
export {
  apiClient,
  conceptsApi,
  connectionsApi,
  cardsApi,
  reviewsApi,
  notesApi,
  statsApi,
  llmApi
};

// 기본 익스포트
export default {
  client: apiClient,
  concepts: conceptsApi,
  connections: connectionsApi,
  cards: cardsApi,
  reviews: reviewsApi,
  notes: notesApi,
  stats: statsApi,
  llm: llmApi
};