// pages/index.tsx - 메인 대시보드
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/common/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { conceptsApi, cardsApi, reviewsApi } from '@/api/client';
import RecentConcepts from '@/components/dashboard/RecentConcepts';
import TodayReview from '@/components/dashboard/TodayReview';
import LearningProgress from '@/components/dashboard/LearningProgress';


export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    concepts: [],
    cards: [],
    dueReviews: [],
    progressData: {
      totalConcepts: 0,
      learnedConcepts: 0,
      totalCards: 0,
      reviewedCards: 0
    }
  });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 병렬로 데이터 요청
        const [concepts, cards, reviews] = await Promise.all([
          conceptsApi.getAll(),
          cardsApi.getAll(),
          reviewsApi.getAll()
        ]);
        
        // 오늘 복습 예정인 카드 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dueReviews = reviews.filter((review: any) => {
          if (!review.next_review_date) return false;
          const reviewDate = new Date(review.next_review_date);
          return reviewDate <= today;
        });
        
        // 진행 상황 데이터 계산
        const conceptsWithCards = new Set();
        cards.forEach((card: any) => {
          conceptsWithCards.add(card.concept_id);
        });
        
        const reviewedCardIds = new Set();
        reviews.forEach((review: any) => {
          reviewedCardIds.add(review.card_id);
        });
        
        const progressData = {
          totalConcepts: concepts.length,
          learnedConcepts: conceptsWithCards.size,
          totalCards: cards.length,
          reviewedCards: reviewedCardIds.size
        };
        
        setDashboardData({
          concepts,
          cards,
          dueReviews,
          progressData
        });
        
        setError(null);
      } catch (err) {
        console.error('대시보드 데이터 로드 중 오류:', err);
        setError(err instanceof Error ? err : new Error('데이터를 불러오는 데 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleGoToGraph = () => {
    router.push('/graph');
  };

  const handleGoToReview = () => {
    router.push('/review');
  };

  const handleGoToStats = () => {
    router.push('/stats');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-sm text-red-700 mb-4">{error.message}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              새로고침
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>개념 그래프 학습 시스템</title>
        <meta name="description" content="개념 그래프 기반 학습 시스템 대시보드" />
      </Head>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">대시보드</h1>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-2">총 개념</h2>
            <p className="text-3xl font-bold text-primary">
              {dashboardData.progressData.totalConcepts}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              학습 시작: {dashboardData.progressData.learnedConcepts}
              {dashboardData.progressData.totalConcepts > 0 ? 
                ` (${Math.round((dashboardData.progressData.learnedConcepts / dashboardData.progressData.totalConcepts) * 100)}%)` : 
                ' (0%)'}
            </p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-2">총 카드</h2>
            <p className="text-3xl font-bold text-secondary">
              {dashboardData.progressData.totalCards}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              복습 시작: {dashboardData.progressData.reviewedCards}
              {dashboardData.progressData.totalCards > 0 ? 
                ` (${Math.round((dashboardData.progressData.reviewedCards / dashboardData.progressData.totalCards) * 100)}%)` : 
                ' (0%)'}
            </p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-2">오늘 복습 예정</h2>
            <p className="text-3xl font-bold text-blue-600">
              {dashboardData.dueReviews.length}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoToReview}
                className="mt-2"
              >
                복습 시작하기
              </Button>
            </p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-2">빠른 링크</h2>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleGoToGraph} size="sm">
                개념 그래프
              </Button>
              <Button onClick={handleGoToStats} size="sm" variant="outline">
                학습 통계
              </Button>
            </div>
          </Card>
        </div>
        
        {/* 진행 상황 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <LearningProgress 
              totalConcepts={dashboardData.progressData.totalConcepts}
              learnedConcepts={dashboardData.progressData.learnedConcepts} 
              totalCards={dashboardData.progressData.totalCards}
              reviewedCards={dashboardData.progressData.reviewedCards}
            />
          </div>
          <div>
            <TodayReview dueReviews={dashboardData.dueReviews} />
          </div>
        </div>
        
        {/* 최근 개념 */}
        <RecentConcepts concepts={dashboardData.concepts.slice(0, 6)} />
      </main>
    </>
  );
}
