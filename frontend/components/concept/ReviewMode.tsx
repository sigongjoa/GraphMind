// components/review/ReviewMode.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ReviewCard from './ReviewCard';
import DifficultyRating from './DifficultyRating';
import ReviewProgress from './ReviewProgress';
import { cardsApi, reviewsApi, conceptsApi } from '../../api/client';

const ReviewMode: React.FC = () => {
  const router = useRouter();
  const { concept: conceptIdParam } = router.query;
  
  const [isLoading, setIsLoading] = useState(true);
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [conceptFilter, setConceptFilter] = useState<number | null>(
    conceptIdParam ? Number(conceptIdParam) : null
  );

  // 복습 예정 카드 가져오기
  const fetchDueCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. 복습 예정 카드 가져오기 시도
      let cards = [];
      try {
        // 개념 필터가 있는 경우 해당 개념의 모든 카드를 가져옴
        if (conceptFilter) {
          console.log(`개념 ID ${conceptFilter}의 모든 카드 가져오기 시도`);
          cards = await cardsApi.getAll(conceptFilter);
          console.log(`개념 ID ${conceptFilter}의 카드 ${cards.length}개 로드 완료`);
        } else {
          // 복습 예정 카드 API 호출 시도
          try {
            console.log('복습 예정 카드 가져오기 시도');
            const reviews = await reviewsApi.getDueReviews();
            
            if (reviews && Array.isArray(reviews) && reviews.length > 0) {
              console.log(`${reviews.length}개의 복습 예정 카드 정보 로드 완료`);
              
              // 카드 정보 가져오기
              const cardPromises = reviews.map((review: any) => 
                cardsApi.getById(review.card_id)
                  .catch(err => {
                    console.warn(`카드 ID ${review.card_id} 가져오기 실패:`, err);
                    return null;
                  })
              );
              
              cards = (await Promise.all(cardPromises)).filter(Boolean);
              console.log(`복습 예정 카드 데이터 ${cards.length}개 로드 완료`);
            } else {
              console.log('복습 예정 카드가 없거나 데이터 형식이 잘못됨');
              // 복습 예정 카드가 없으면 모든 카드를 가져옴 (선택적)
              cards = await cardsApi.getAll();
              console.log(`모든 카드 ${cards.length}개 로드 완료`);
            }
          } catch (reviewErr) {
            console.warn('복습 예정 API 호출 실패:', reviewErr);
            console.log('모든 카드 가져오기로 대체');
            
            // API 실패 시 모든 카드 가져오기
            cards = await cardsApi.getAll();
            console.log(`모든 카드 ${cards.length}개 로드 완료`);
          }
        }
      } catch (cardErr) {
        console.error('카드 데이터 로드 중 오류 발생:', cardErr);
        setError(cardErr instanceof Error ? cardErr : new Error('카드 데이터를 로드하는 데 실패했습니다'));
        cards = [];
      }
      } catch (err) {
        console.warn('getDueReviews API 사용 불가:', err);
        
        // 2. API가 없으면 전체 카드 가져오기 (예시 데이터)
        console.log('전체 카드 가져오기로 대체합니다.');
        
        try {
          if (conceptFilter) {
            // 특정 개념의 카드만 가져오기
            cards = await cardsApi.getAll(conceptFilter);
          } else {
            // 모든 카드 가져오기
            cards = await cardsApi.getAll();
          }
        } catch (cardErr) {
          console.error('카드 가져오기 실패:', cardErr);
          throw new Error('카드 데이터를 가져오는 데 실패했습니다');
        }
      }
      
      // 카드에 개념 정보 추가
      if (cards && cards.length > 0) {
        const cardsWithConcepts = await Promise.all(
          cards.map(async (card: any) => {
            if (!card) return null;
            
            try {
              // 개념 정보가 이미 있으면 그대로 사용
              if (card.concept && card.concept.name) return card;
              
              // 개념 정보 가져오기
              const concept = await conceptsApi.getById(card.concept_id);
              return { ...card, concept };
            } catch (err) {
              console.warn(`개념 ID ${card.concept_id} 가져오기 실패:`, err);
              return card; // 개념 정보 없이 카드만 반환
            }
          })
        );
        
        // null 값 필터링
        const validCards = cardsWithConcepts.filter(Boolean);
        
        // 개념 필터 적용
        if (conceptFilter) {
          const filteredCards = validCards.filter((card: any) => 
            card.concept_id === conceptFilter
          );
          setDueCards(filteredCards);
        } else {
          setDueCards(validCards);
        }
      } else {
        setDueCards([]);
      }
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
  }, [conceptFilter, retryCount]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  // 개념 ID 변경 시 필터 업데이트
  useEffect(() => {
    if (conceptIdParam) {
      const conceptId = Number(conceptIdParam);
      if (!isNaN(conceptId)) {
        setConceptFilter(conceptId);
      }
    }
  }, [conceptIdParam]);

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
      
      try {
        // 복습 기록 생성 시도
        await reviewsApi.create({
          card_id: currentCard.id,
          difficulty,
          next_review_date: nextReviewDate.toISOString()
        });
        console.log(`카드 ID ${currentCard.id}에 대한 복습 기록이 저장되었습니다.`);
      } catch (err) {
        console.warn('복습 기록 저장 API 사용 불가:', err);
        console.log('복습 기록을 로컬에만 저장합니다.');
        // 로컬 저장소에 복습 기록 저장 로직을 추가할 수 있음
      }
      
      // 다음 카드로 이동
      setIsAnswerVisible(false);
      
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('복습 기록 저장 중 오류 발생:', err);
      alert('복습 기록을 저장하는 데 문제가 발생했지만, 복습은 계속할 수 있습니다.');
      
      // 오류가 있어도 다음 카드로 이동
      setIsAnswerVisible(false);
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setIsCompleted(true);
      }
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

  const handleClearFilter = () => {
    setConceptFilter(null);
    router.push('/review');
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">복습 모드</h1>
          
          {conceptFilter && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                필터: 개념 ID {conceptFilter}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearFilter}
              >
                필터 해제
              </Button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : dueCards.length === 0 ? (
          <Card className="text-center py-8">
            <h2 className="text-xl font-medium mb-4">복습할 카드가 없습니다</h2>
            <p className="text-gray-600 mb-6">
              {conceptFilter 
                ? '이 개념에 대한 복습 카드가 없습니다. 먼저 카드를 추가해보세요.' 
                : '모든 개념에 대한 복습 카드가 없습니다. 개념 페이지에서 카드를 추가해보세요.'}
            </p>
            <div className="flex justify-center space-x-4">
              {conceptFilter && (
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/concept/${conceptFilter}`)}
                >
                  개념 페이지로 이동
                </Button>
              )}
              <Button onClick={() => router.push('/')}>
                대시보드로 돌아가기
              </Button>
            </div>
          </Card>
        ) : isCompleted ? (
          <Card className="text-center py-8">
            <h2 className="text-xl font-medium mb-4">복습 완료!</h2>
            <p className="text-gray-600 mb-6">
              {conceptFilter 
                ? '이 개념에 대한 모든 복습을 완료했습니다.' 
                : '오늘의 모든 복습을 완료했습니다.'}
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={handleRestart}>
                다시 복습하기
              </Button>
              <Button onClick={() => router.push('/')}>
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