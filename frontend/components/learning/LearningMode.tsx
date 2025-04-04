import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import ErrorBoundary from '../common/ErrorBoundary';
import LLMInteraction from './LLMInteraction'; // 개선된 컴포넌트 사용
import LLMStatus from './LLMStatus';
import { conceptsApi } from '../../api/client';
import llmApi from '../../api/llm_client';

const LearningMode: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const conceptId = typeof id === 'string' ? parseInt(id, 10) : undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [concept, setConcept] = useState<any>(null);
  const [relatedConcepts, setRelatedConcepts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [llmStatus, setLlmStatus] = useState<{ status: string; message?: string }>({ 
    status: 'unknown' 
  });
  const [isCheckingLlm, setIsCheckingLlm] = useState(true);

  // LLM 상태 확인 함수
  const checkLlmStatus = useCallback(async () => {
    try {
      setIsCheckingLlm(true);
      const status = await llmApi.checkHealth();
      console.log("LLM 상태 확인 결과:", status);
      setLlmStatus(status);
    } catch (err) {
      console.error('LLM 상태 확인 중 오류:', err);
      setLlmStatus({ 
        status: 'offline', 
        message: '연결할 수 없습니다'
      });
    } finally {
      setIsCheckingLlm(false);
    }
  }, []);

  // 컴포넌트 마운트시 LLM 상태 확인
  useEffect(() => {
    checkLlmStatus();
  }, [checkLlmStatus]);

  // 개념 데이터 가져오기
  useEffect(() => {
    if (!conceptId) return;

    const fetchConceptData = async () => {
      try {
        setIsLoading(true);
        
        // 개념 데이터 가져오기
        const conceptData = await conceptsApi.getById(conceptId);
        setConcept(conceptData);
        
        // 초기 메시지 설정
        setMessages([
          {
            role: 'system',
            content: `안녕하세요! "${conceptData.name}" 개념에 대해 학습해보겠습니다. 어떤 것이 궁금하신가요?`
          }
        ]);
        
        // 관련 개념 추천 받기 (LLM 상태가 온라인일 때만)
        if (llmStatus.status === 'online') {
          try {
            const suggestedConcepts = await llmApi.suggestConcepts(conceptData.name);
            setRelatedConcepts(suggestedConcepts.concepts || []);
          } catch (err) {
            console.warn('관련 개념 추천 실패:', err);
            // 기존 관련 개념 사용
            setRelatedConcepts(conceptData.related_concepts || []);
          }
        } else {
          // LLM 오프라인 - 기존 관련 개념 사용
          setRelatedConcepts(conceptData.related_concepts || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('학습 모드 데이터 로딩 중 오류 발생:', err);
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchConceptData();
  }, [conceptId, llmStatus.status]);

  // 메시지 전송 처리
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !concept) return;
    
    // 사용자 메시지 추가
    const updatedMessages = [
      ...messages,
      { role: 'user', content: message }
    ];
    setMessages(updatedMessages);
    
    try {
      // LLM 응답 요청
      let response;
      
      if (llmStatus.status === 'online') {
        // LLM 서비스 사용
        response = await llmApi.getResponse(message, concept.name);
      } else {
        // 목업 응답 사용
        response = {
          response: `죄송합니다. 현재 LLM 서비스가 ${llmStatus.status === 'offline' ? '오프라인' : '응답하지 않는'} 상태입니다. 나중에 다시 시도해 주세요.`
        };
      }
      
      // LLM 응답 추가
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: response.response }
      ]);
    } catch (err) {
      console.error('LLM 응답 가져오기 오류:', err);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.' }
      ]);
    }
  };

  // 문제 생성 처리
  const handleGenerateQuestion = async (difficulty: number = 1) => {
    if (!concept) return;
    
    try {
      setIsLoading(true);
      
      let question;
      if (llmStatus.status === 'online') {
        // LLM 서비스 사용
        question = await llmApi.generateQuestion(concept.name, difficulty);
      } else {
        // 목업 응답 사용
        question = {
          question: `${concept.name}의 주요 특징은 무엇인가요?`,
          answer: `${concept.name}의 주요 특징은 [특징 1], [특징 2], [특징 3] 등이 있습니다.`,
          explanation: `이 문제는 ${concept.name}의 기본적인 이해를 테스트합니다. LLM 서비스가 오프라인 상태이므로 상세한 응답을 제공할 수 없습니다.`
        };
      }
      
      setGeneratedQuestion(question);
      setIsModalOpen(true);
    } catch (err) {
      console.error('문제 생성 중 오류 발생:', err);
      setError(err instanceof Error ? err : new Error('문제 생성 중 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  };

  // LLM 서비스 재연결 처리
  const handleRetryLlmConnection = async () => {
    await checkLlmStatus();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-sm text-red-700">{error.message}</p>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              새로고침
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isLoading && !concept ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{concept?.name} 학습하기</h1>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/concept/${conceptId}`)}
                >
                  개념 상세
                </Button>
                <Button 
                  onClick={() => handleGenerateQuestion()}
                  isLoading={isLoading}
                  disabled={isLoading || llmStatus.status !== 'online'}
                >
                  문제 생성
                </Button>
              </div>
            </div>
            
            {/* LLM 상태 표시 */}
            <LLMStatus 
              status={llmStatus}
              isChecking={isCheckingLlm}
              onRetry={handleRetryLlmConnection}
              className="mb-4"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="mb-6">
                  <h2 className="text-lg font-medium mb-2">개념 설명</h2>
                  <p className="text-gray-700">{concept?.description}</p>
                </Card>
                
                <ErrorBoundary>
                  {/* 명시적 높이 설정으로 스크롤 작동 보장 */}
                  <Card className="h-[500px] overflow-y-auto">
                    <div className="h-full">
                      <LLMInteraction 
                        messages={messages} 
                        onSendMessage={handleSendMessage} 
                        isLlmOffline={llmStatus.status !== 'online'}
                      />
                    </div>
                  </Card>
                </ErrorBoundary>
              </div>
              
              <div>
                <Card title="관련 개념">
                  {relatedConcepts.length > 0 ? (
                    <ul className="space-y-2">
                      {relatedConcepts.map((relatedConcept, index) => (
                        <li key={index} className="border-l-4 border-primary pl-3 py-1">
                          <p className="font-medium">{relatedConcept.name}</p>
                          <p className="text-xs text-gray-600">{relatedConcept.relation}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">관련 개념이 없습니다.</p>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="개념 문제"
        size="lg"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              닫기
            </Button>
          </div>
        }
      >
        {generatedQuestion && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">문제</h3>
              <p className="bg-gray-50 p-4 rounded">{generatedQuestion.question}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">정답</h3>
              <div className="bg-green-50 p-4 rounded">
                <p>{generatedQuestion.answer}</p>
              </div>
            </div>
            
            {generatedQuestion.explanation && (
              <div>
                <h3 className="text-lg font-medium mb-2">해설</h3>
                <p className="bg-blue-50 p-4 rounded">{generatedQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LearningMode;