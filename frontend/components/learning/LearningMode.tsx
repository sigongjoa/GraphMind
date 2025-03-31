// 학습 모드 컴포넌트: LearningMode.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import LLMInteraction from './LLMInteraction';

interface LearningModeProps {
  username?: string;
}

interface Concept {
  id: number;
  name: string;
  description: string;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const LearningMode: React.FC<LearningModeProps> = ({ username = '사용자' }) => {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  
  useEffect(() => {
    if (!id) return;

    // 실제 구현에서는 API에서 데이터를 가져옵니다
    const fetchConceptData = async () => {
      try {
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 샘플 데이터
        const conceptData: Concept = {
          id: Number(id),
          name: '소프트웨어 공학',
          description: '소프트웨어 공학은 소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문입니다. 고품질의 소프트웨어를 비용 효율적으로 개발하는 것을 목표로 합니다.'
        };
        
        setConcept(conceptData);
        
        // 초기 메시지 설정
        setMessages([
          {
            role: 'system',
            content: `${conceptData.name}에 대해 학습해 봅시다.`
          },
          {
            role: 'assistant',
            content: `${conceptData.description}\n\n${conceptData.name}의 주요 목표는 무엇일까요?`
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('개념 데이터 로딩 실패:', error);
        setLoading(false);
      }
    };

    fetchConceptData();
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // 사용자 메시지 추가
    const newMessages = [
      ...messages,
      { role: 'user', content: userInput }
    ];
    
    setMessages(newMessages);
    setUserInput('');
    
    // 실제 구현에서는 LLM API 호출
    setTimeout(() => {
      // 목업 응답
      let response = '';
      
      if (userInput.toLowerCase().includes('목표')) {
        response = '정확합니다! 소프트웨어 공학의 주요 목표는 고품질의 소프트웨어를 비용 효율적으로 개발하는 것입니다.\n\n소프트웨어 개발 생명주기(SDLC)의 주요 단계에 대해 알고 계신가요?';
      } else {
        response = '소프트웨어 공학의 주요 목표는 고품질의 소프트웨어를 비용 효율적으로 개발하는 것입니다.\n\n다른 질문이 있으신가요?';
      }
      
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);
    }, 1000);
  };

  const handleExplanationRequest = () => {
    if (!concept) return;
    
    // 설명 요청 메시지 추가
    const newMessages = [
      ...messages,
      { role: 'user', content: `${concept.name}에 대해 자세히 설명해주세요.` }
    ];
    
    setMessages(newMessages);
    
    // 실제 구현에서는 LLM API 호출
    setTimeout(() => {
      // 목업 응답
      const response = `${concept.name}은(는) 소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문입니다.

소프트웨어 공학의 주요 목표:
1. 고품질의 소프트웨어를 비용 효율적으로 개발
2. 사용자 요구사항 충족
3. 유지보수 용이성 확보

소프트웨어 개발 생명주기(SDLC)의 주요 단계:
1. 요구사항 분석: 사용자의 요구를 파악하고 문서화
2. 설계: 소프트웨어 구조와 컴포넌트 설계
3. 구현: 실제 코드 작성
4. 테스트: 결함 식별 및 수정
5. 배포: 사용자에게 소프트웨어 제공
6. 유지보수: 결함 수정, 기능 개선, 환경 적응

소프트웨어 공학 방법론에는 폭포수 모델, 애자일, 스크럼, XP 등이 있습니다.`;
      
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);
    }, 1000);
  };

  const handleQuestionGeneration = () => {
    if (!concept) return;
    
    // 문제 생성 요청 메시지 추가
    const newMessages = [
      ...messages,
      { role: 'user', content: `${concept.name}에 대한 문제를 생성해주세요.` }
    ];
    
    setMessages(newMessages);
    
    // 실제 구현에서는 LLM API 호출
    setTimeout(() => {
      // 목업 응답
      const response = `다음은 ${concept.name}에 대한 문제입니다:

질문: 소프트웨어 개발 생명주기(SDLC)의 주요 단계를 순서대로 나열하시오.

답변을 입력해주세요.`;
      
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);
    }, 1000);
  };

  const handleRelatedConceptsRequest = () => {
    if (!concept) return;
    
    // 관련 개념 추천 요청 메시지 추가
    const newMessages = [
      ...messages,
      { role: 'user', content: `${concept.name}과(와) 관련된 개념을 추천해주세요.` }
    ];
    
    setMessages(newMessages);
    
    // 실제 구현에서는 LLM API 호출
    setTimeout(() => {
      // 목업 응답
      const response = `${concept.name}과(와) 관련된 개념들은 다음과 같습니다:

1. 요구사항 분석: 소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정
2. 유지보수: 소프트웨어를 인도한 후에 결함을 수정하고, 성능을 개선하며, 변화된 환경에 적응시키는 과정
3. 소프트웨어 테스팅: 소프트웨어가 요구사항을 충족하는지 확인하고 결함을 식별하는 과정
4. 소프트웨어 설계: 요구사항을 소프트웨어 구조로 변환하는 과정
5. 소프트웨어 품질 보증: 소프트웨어 제품이 정의된 품질 표준을 충족하는지 확인하는 과정

이 중에서 어떤 개념에 대해 더 알고 싶으신가요?`;
      
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);
    }, 1000);
  };

  const handleSaveToNote = () => {
    if (!concept) return;
    
    // 실제 구현에서는 API 호출하여 노트 저장
    alert('대화 내용이 노트로 저장되었습니다.');
  };

  if (loading || !concept) {
    return (
      <div className="min-h-screen bg-background">
        <Header username={username} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader size="lg" text="학습 데이터를 불러오는 중..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <a 
            href={`/concept/${concept.id}`}
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            개념 상세로 돌아가기
          </a>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">학습 모드: {concept.name}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <LLMInteraction messages={messages} />
          
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex flex-col space-y-2">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="답변을 입력하세요..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit">제출하기</Button>
              </div>
            </div>
          </form>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">학습 옵션:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card hoverable onClick={handleExplanationRequest}>
              <div className="flex flex-col items-center justify-center py-4">
                <svg className="h-8 w-8 text-primary mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-center font-medium">개념 설명 요청</span>
              </div>
            </Card>
            
            <Card hoverable onClick={handleQuestionGeneration}>
              <div className="flex flex-col items-center justify-center py-4">
                <svg className="h-8 w-8 text-primary mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="text-center font-medium">문제 생성 요청</span>
              </div>
            </Card>
            
            <Card hoverable onClick={handleRelatedConceptsRequest}>
              <div className="flex flex-col items-center justify-center py-4">
                <svg className="h-8 w-8 text-primary mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-center font-medium">관련 개념 추천</span>
              </div>
            </Card>
            
            <Card hoverable onClick={handleSaveToNote}>
              <div className="flex flex-col items-center justify-center py-4">
                <svg className="h-8 w-8 text-primary mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  <path d="M8 11a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0-3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                </svg>
                <span className="text-center font-medium">노트에 저장</span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningMode;
