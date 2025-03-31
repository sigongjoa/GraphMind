// 대시보드 컴포넌트: Dashboard.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import LearningProgress from './LearningProgress';
import ReviewSchedule from './ReviewSchedule';
import RecentConcepts from './RecentConcepts';
import Loader from '../common/Loader';

interface DashboardProps {
  username?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ username = '사용자' }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 구현에서는 API에서 데이터를 가져옵니다
    const fetchDashboardData = async () => {
      try {
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header username={username} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader size="lg" text="데이터를 불러오는 중..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">대시보드</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <LearningProgress progress={60} />
          <ReviewSchedule 
            dueCards={[
              { id: 1, title: '소프트웨어 공학' },
              { id: 2, title: '요구사항 분석' },
              { id: 3, title: '유지보수' }
            ]} 
          />
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">최근 학습 개념</h2>
        <RecentConcepts 
          concepts={[
            { id: 1, name: '소프트웨어 공학', description: '소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문' },
            { id: 2, name: '유지보수', description: '소프트웨어를 인도한 후에 결함을 수정하고, 성능을 개선하며, 변화된 환경에 적응시키는 과정' },
            { id: 3, name: '요구사항 분석', description: '소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정' },
            { id: 4, name: '집합론', description: '집합이라는 개념과 그 연산에 대해 연구하는 학문' }
          ]} 
        />
        
        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">주요 기능</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/graph">
            <a>
              <Card hoverable className="h-full">
                <div className="flex flex-col items-center justify-center py-4">
                  <svg className="h-10 w-10 text-primary mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 12h3v2h-3v3h-2v-3h-3v-2h3V9h2v3zm-5-5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-7 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm14 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zM7 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm16 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  <span className="text-center font-medium">개념 그래프</span>
                </div>
              </Card>
            </a>
          </Link>
          
          <Link href="/learning">
            <a>
              <Card hoverable className="h-full">
                <div className="flex flex-col items-center justify-center py-4">
                  <svg className="h-10 w-10 text-primary mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                  </svg>
                  <span className="text-center font-medium">학습 모드</span>
                </div>
              </Card>
            </a>
          </Link>
          
          <Link href="/review">
            <a>
              <Card hoverable className="h-full">
                <div className="flex flex-col items-center justify-center py-4">
                  <svg className="h-10 w-10 text-primary mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                  <span className="text-center font-medium">복습 모드</span>
                </div>
              </Card>
            </a>
          </Link>
          
          <Link href="/notes">
            <a>
              <Card hoverable className="h-full">
                <div className="flex flex-col items-center justify-center py-4">
                  <svg className="h-10 w-10 text-primary mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                    <path d="M7 7h10v2H7zM7 11h10v2H7zM7 15h7v2H7z" />
                  </svg>
                  <span className="text-center font-medium">노트 관리</span>
                </div>
              </Card>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
