// frontend/components/review/ReviewMode.tsx
import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ReviewCard from './ReviewCard';
import DifficultyRating from './DifficultyRating';
import ReviewProgress from './ReviewProgress';
import { cardsApi, reviewsApi, conceptsApi } from '../../api/client';

const ReviewMode: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchDueCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // API에서 제공하는 경우 getDueReviews 메서드 사용
        let reviews;
        try {
          reviews = await reviewsApi.getDueReviews();
        } catch (e) {
          console.warn('getDueReviews API를 사용할 수 없습니다. 대안 방법을 사용합니다.');
          
          // 모든 복습 데이터 가져오기
          const allReviews = await reviewsApi.getAll();
          
          // 오늘 복습할 카드 필터링
          const today = new Date();
          reviews = allReviews.filter((review: any) => {
            // next_review_date가 없는 경우 기본 포함
            if (!review.next_review_date) return true;
            
            const reviewDate = new Date(review.next_review_date);
            return reviewDate <= today;
          });
        }
        
        if (!reviews || reviews.length === 0) {
          setDueCards([]);
          setIsLoading(false);
          return;
        }
        
        // 카드 정보 가져오기
        const cardPromises = reviews.map((review: any) => 
          cardsApi.getById(review.card_id)
            .catch(err => {
              console.warn(`카드 ID ${review.card_id} 가져오기 실패:`, err);
              return null; // 실패한 카드는 null로 처리
            })
        );
        
        const cards = await Promise.all(cardPromises);
        const validCards = cards.filter(card => card !== null);
        
        // 개념 정보 포함하기
        const cardsWithConcepts = await Promise.all(
          validCards.map(async (card: any) => {
            try {
              const concept = await conceptsApi.getById(card.concept_id);
              return { ...card, concept };
            } catch (err) {
              console.warn(`개념 ID ${card.concept_id} 가져오기 실패:`, err);
              return card; // 개념 정보 없이 카드만 반환
            }
          })
        );
        
        setDueCards(cardsWithConcepts);
      } catch (err) {
        console.error('복습 카드 로딩 중 오류 발생:', err);
        setError(err instanceof Error ? err : new Error('복습 카드 로딩 중 오류가 발생했습니다'));
        
        // 자동 재시도 (최대 3회)
        if (retryCount < 3) {
          console.log(`데이터 로딩 재시도 중... (${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000); // 2초 후 재시도
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDueCards();
  }, [retryCount]);

  const handleShowAnswer = () => {
    setIsAnswerVisible(true);
  };

  const handleRateDifficulty = async (difficulty: number) => {
    if (currentCardIndex >= dueCards.length) return;
    
    try {
      const currentCard = dueCards[currentCardIndex];
      
      // SM-2 알고리즘에 따라 다음 복습 일정 계산
      const today = new Date();
      let nextReviewDate = new Date();
      
      if (difficulty <= 2) {
        // 어려움: 1일 후
        nextReviewDate.setDate(today.getDate() + 1);
      } else if (difficulty === 3) {
        // 보통: 3일 후
        nextReviewDate.setDate(today.getDate() + 3);
      } else {
        // 쉬움: 7일 후
        nextReviewDate.setDate(today.getDate() + 7);
      }
      
      // 복습 기록 생성
      await reviewsApi.create({
        card_id: currentCard.id,
        difficulty,
        next_review_date: nextReviewDate.toISOString()
      });
      
      // 다음 카드로 이동
      setIsAnswerVisible(false);
      
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('복습 기록 저장 중 오류 발생:', err);
      alert('복습 기록 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      setError(err instanceof Error ? err : new Error('복습 기록 저장 중 오류가 발생했습니다'));
    } finally {
      // 페이드 효과를 위한 지연
      setTimeout(() => {
        if (currentCardIndex >= dueCards.length - 1) {
          setIsCompleted(true);
        }
      }, 300);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsAnswerVisible(false);
    setIsCompleted(false);
  };

  const handleRefresh = () => {
    setRetryCount(0); // 재시도 카운트 초기화하여 데이터 다시 로드
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-sm text-red-700 mb-4">{error.message}</p>
            <Button 
              variant="outline"
              onClick={handleRefresh}
            >
              다시 시도
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
        <h1 className="text-2xl font-bold mb-6">복습 모드</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : dueCards.length === 0 ? (
          <Card className="text-center py-8">
            <h2 className="text-xl font-medium mb-4">오늘 복습할 카드가 없습니다</h2>
            <p className="text-gray-600 mb-6">모든 복습을 완료했습니다. 내일 다시 확인해보세요.</p>
            <Button onClick={() => window.location.href = '/'}>
              대시보드로 돌아가기
            </Button>
          </Card>
        ) : isCompleted ? (
          <Card className="text-center py-8">
            <h2 className="text-xl font-medium mb-4">복습 완료!</h2>
            <p className="text-gray-600 mb-6">오늘의 모든 복습을 완료했습니다.</p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={handleRestart}>
                다시 복습하기
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                대시보드로 돌아가기
              </Button>
            </div>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto">
            <ReviewProgress 
              current={currentCardIndex + 1} 
              total={dueCards.length} 
            />
            
            <div className="mb-6">
              <ReviewCard 
                card={dueCards[currentCardIndex]} 
                isAnswerVisible={isAnswerVisible} 
              />
            </div>
            
            {!isAnswerVisible ? (
              <div className="text-center">
                <Button onClick={handleShowAnswer}>
                  정답 확인하기
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-center text-lg font-medium mb-4">난이도 평가</h3>
                <DifficultyRating onRate={handleRateDifficulty} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReviewMode;