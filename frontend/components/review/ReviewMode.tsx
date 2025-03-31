// 복습 모드 컴포넌트: ReviewMode.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../common/Header';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ReviewCard from './ReviewCard';
import ReviewProgress from './ReviewProgress';
import DifficultyRating from './DifficultyRating';

interface ReviewModeProps {
  username?: string;
}

interface Card {
  id: number;
  conceptId: number;
  conceptName: string;
  question: string;
  answer: string;
  explanation?: string;
}

const ReviewMode: React.FC<ReviewModeProps> = ({ username = '사용자' }) => {
  const router = useRouter();
  const { concept: conceptId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [completed, setCompleted] = useState(0);
  
  useEffect(() => {
    // 실제 구현에서는 API에서 데이터를 가져옵니다
    const fetchReviewCards = async () => {
      try {
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 샘플 데이터
        const cardsData: Card[] = [
          {
            id: 1,
            conceptId: 1,
            conceptName: '소프트웨어 공학',
            question: '소프트웨어 공학의 주요 목표는 무엇인가?',
            answer: '고품질의 소프트웨어를 비용 효율적으로 개발하는 것',
            explanation: '소프트웨어 공학은 체계적이고 규율적인 접근 방식을 통해 신뢰성 있고 효율적인 소프트웨어를 개발하는 것을 목표로 합니다.'
          },
          {
            id: 2,
            conceptId: 1,
            conceptName: '소프트웨어 공학',
            question: '소프트웨어 개발 생명주기(SDLC)의 주요 단계를 나열하시오.',
            answer: '요구사항 분석, 설계, 구현, 테스트, 배포, 유지보수',
            explanation: '소프트웨어 개발 생명주기는 소프트웨어 개발 과정을 체계적으로 관리하기 위한 프레임워크입니다. 각 단계는 특정 활동과 산출물을 포함합니다.'
          },
          {
            id: 3,
            conceptId: 2,
            conceptName: '요구사항 분석',
            question: '요구사항 분석의 주요 목적은 무엇인가?',
            answer: '사용자의 요구를 파악하고 이를 명확하게 정의하여 개발 과정의 기초를 마련하는 것',
            explanation: '요구사항 분석은 소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정으로, 개발 과정의 방향을 설정합니다.'
          },
          {
            id: 4,
            conceptId: 3,
            conceptName: '유지보수',
            question: '유지보수의 4가지 유형은 무엇인가?',
            answer: '수정 유지보수, 적응 유지보수, 완전 유지보수, 예방 유지보수',
            explanation: '수정 유지보수는 결함 수정, 적응 유지보수는 환경 변화 대응, 완전 유지보수는 기능 개선, 예방 유지보수는 미래 문제 예방을 위한 것입니다.'
          },
          {
            id: 5,
            conceptId: 3,
            conceptName: '유지보수',
            question: '유지보수가 소프트웨어 개발 비용에서 차지하는 비중은 일반적으로 얼마인가?',
            answer: '약 60-80%',
            explanation: '소프트웨어의 전체 생명주기 비용 중 유지보수 비용이 가장 큰 비중을 차지하며, 이는 소프트웨어가 오랜 기간 사용되고 지속적으로 변경되기 때문입니다.'
          }
        ];
        
        // 특정 개념 ID가 있으면 필터링
        const filteredCards = conceptId 
          ? cardsData.filter(card => card.conceptId === Number(conceptId))
          : cardsData;
        
        setCards(filteredCards);
        setLoading(false);
      } catch (error) {
        console.error('복습 카드 로딩 실패:', error);
        setLoading(false);
      }
    };

    fetchReviewCards();
  }, [conceptId]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
    } else {
      // 모든 카드 복습 완료
      alert('모든 카드의 복습을 완료했습니다!');
      router.push('/');
    }
  };

  const handleDifficultyRating = (rating: number) => {
    // 실제 구현에서는 API 호출하여 복습 기록 저장
    console.log(`카드 ID: ${cards[currentCardIndex].id}, 난이도 평가: ${rating}`);
    
    setCompleted(completed + 1);
    handleNextCard();
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    handleShowAnswer();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header username={username} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader size="lg" text="복습 데이터를 불러오는 중..." />
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header username={username} />
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <a 
              href="/"
              className="flex items-center text-primary hover:text-primary-dark"
            >
              <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              대시보드로 돌아가기
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">복습할 카드가 없습니다</h2>
            <p className="text-gray-600 mb-4">현재 복습 예정인 카드가 없습니다.</p>
            <Button onClick={() => router.push('/')}>대시보드로 돌아가기</Button>
          </div>
        </main>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = (completed / cards.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <a 
            href="/"
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            대시보드로 돌아가기
          </a>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">복습 모드</h1>
        
        <ReviewProgress 
          current={completed + 1} 
          total={cards.length} 
          progress={progress} 
        />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <ReviewCard 
            card={currentCard} 
            showAnswer={showAnswer} 
            onShowAnswer={handleShowAnswer} 
          />
          
          {!showAnswer && (
            <form onSubmit={handleSubmitAnswer} className="mt-4">
              <div className="flex flex-col space-y-2">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="답변을 입력하세요..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="submit">제출하기</Button>
                </div>
              </div>
            </form>
          )}
          
          {showAnswer && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">난이도 평가:</h3>
              <DifficultyRating onRate={handleDifficultyRating} />
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            복습 종료
          </Button>
          
          <Button 
            onClick={handleNextCard}
            disabled={!showAnswer || currentCardIndex >= cards.length - 1}
          >
            다음 카드
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ReviewMode;
