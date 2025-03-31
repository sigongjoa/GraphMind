import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Card from '../common/Card';
import LearningProgress from './LearningProgress';
import ReviewSchedule from './ReviewSchedule';
import RecentConcepts from './RecentConcepts';
import ErrorBoundary from '../common/ErrorBoundary';
import Loader from '../common/Loader';
import { conceptsApi, cardsApi, reviewsApi } from '../../api/client';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [concepts, setConcepts] = useState([]);
  const [dueReviews, setDueReviews] = useState([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 병렬로 데이터 가져오기
        const [conceptsData, reviewsData] = await Promise.all([
          conceptsApi.getAll(),
          reviewsApi.getAll()
        ]);
        
        setConcepts(conceptsData);
        
        // 오늘 복습할 카드 필터링
        const today = new Date();
        const dueReviewsData = reviewsData.filter((review: any) => {
          const reviewDate = new Date(review.next_review_date);
          return reviewDate <= today;
        });
        
        setDueReviews(dueReviewsData);
        setError(null);
      } catch (err) {
        console.error('대시보드 데이터 로딩 중 오류 발생:', err);
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">데이터 로딩 중 오류가 발생했습니다</h2>
            <p className="text-sm text-red-700">{error.message}</p>
            <button 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              새로고침
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">대시보드</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ErrorBoundary>
              <Card title="학습 진행 상황" className="md:col-span-2 lg:col-span-3">
                <LearningProgress concepts={concepts} />
              </Card>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Card title="오늘의 복습">
                <ReviewSchedule dueReviews={dueReviews} />
              </Card>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Card title="최근 학습한 개념" className="md:col-span-1 lg:col-span-2">
                <RecentConcepts concepts={concepts.slice(0, 5)} />
              </Card>
            </ErrorBoundary>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
