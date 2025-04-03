// frontend/components/stats/StatsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ErrorBoundary from '../common/ErrorBoundary';
import { statsApi } from '../../api/client';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const StatsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<any>({
    learningStats: null,
    progressStats: null,
    reviewStats: null
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [retryCount, setRetryCount] = useState(0);

  // 통계 데이터 로드
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 기본적인 통계 데이터 생성 (API 실패 시 대체)
        const defaultData = {
          learningStats: {
            total_concepts: 0,
            total_cards: 0,
            total_reviews: 0,
            difficulty_stats: { distribution: [] },
            activity_stats: []
          },
          progressStats: {
            total_concepts: 0,
            learned_concepts: 0,
            learning_progress: 0,
            total_cards: 0,
            reviewed_cards: 0,
            review_progress: 0,
            due_today: 0,
            monthly_activities: [
              { month: new Date().toISOString().substring(0, 7), learning_count: 0, review_count: 0 }
            ]
          },
          reviewStats: {
            total_reviews: 0,
            daily_stats: [],
            retention_stats: []
          }
        };
        
        try {
          // 병렬로 다양한 통계 데이터 로드
          const [learningStats, progressStats, reviewStats] = await Promise.all([
            statsApi.getLearningStats().catch(() => defaultData.learningStats),
            statsApi.getProgressStats().catch(() => defaultData.progressStats),
            statsApi.getReviewStats().catch(() => defaultData.reviewStats)
          ]);
          
          setStats({
            learningStats: learningStats || defaultData.learningStats,
            progressStats: progressStats || defaultData.progressStats,
            reviewStats: reviewStats || defaultData.reviewStats
          });
        } catch (err) {
          console.error('통계 API 호출 실패, 기본 데이터 사용:', err);
          setStats(defaultData);
        }
      } catch (err) {
        console.error('통계 데이터 로딩 중 오류 발생:', err);
        setError(err instanceof Error ? err : new Error('통계 데이터를 불러오는 데 문제가 발생했습니다'));
        
        // 자동 재시도 로직 (최대 3회)
        if (retryCount < 3) {
          console.log(`데이터 로딩 재시도 중... (${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [retryCount]);

  // 학습 진행 도넛 차트 데이터
  const getLearningProgressChartData = () => {
    if (!stats.progressStats || typeof stats.progressStats.learned_concepts === 'undefined') {
      // 기본 데이터 반환
      return {
        labels: ['학습 완료', '미학습'],
        datasets: [{ data: [0, 100], backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(211, 211, 211, 0.8)'] }]
      };
    }
    
    const learned = stats.progressStats.learned_concepts;
    const total = stats.progressStats.total_concepts;
    const remaining = Math.max(0, total - learned);
    
    return {
      labels: ['학습 완료', '미학습'],
      datasets: [
        {
          data: [learned, remaining],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(211, 211, 211, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(211, 211, 211, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // 복습 진행 도넛 차트 데이터
  const getReviewProgressChartData = () => {
    if (!stats.progressStats || typeof stats.progressStats.reviewed_cards === 'undefined') {
      // 기본 데이터 반환
      return {
        labels: ['복습 완료', '미복습'],
        datasets: [{ data: [0, 100], backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(211, 211, 211, 0.8)'] }]
      };
    }
    
    const reviewed = stats.progressStats.reviewed_cards;
    const total = stats.progressStats.total_cards;
    const remaining = Math.max(0, total - reviewed);
    
    return {
      labels: ['복습 완료', '미복습'],
      datasets: [
        {
          data: [reviewed, remaining],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(211, 211, 211, 0.8)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(211, 211, 211, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // 월별 활동 추세 차트 데이터
  const getMonthlyActivityChartData = () => {
    if (!stats.progressStats?.monthly_activities || !Array.isArray(stats.progressStats.monthly_activities)) {
      // 기본 데이터 반환
      return {
        labels: ['1월', '2월', '3월'],
        datasets: [
          { label: '학습 활동', data: [0, 0, 0], backgroundColor: 'rgba(54, 162, 235, 0.5)' },
          { label: '복습 활동', data: [0, 0, 0], backgroundColor: 'rgba(75, 192, 192, 0.5)' }
        ]
      };
    }
    
    // 데이터 필터링 (선택한 시간 범위에 따라)
    let filteredData = [...stats.progressStats.monthly_activities];
    if (timeRange === 'week') {
      filteredData = filteredData.slice(0, 1);
    } else if (timeRange === 'month') {
      filteredData = filteredData.slice(0, 3);
    } else {
      filteredData = filteredData.slice(0, 12);
    }
    
    // 최신 데이터가 오른쪽에 오도록 순서 조정
    filteredData = filteredData.reverse();
    
    // 빈 데이터 체크 후 기본값 지정
    if (filteredData.length === 0) {
      filteredData = [{ month: new Date().toISOString().substring(0, 7), learning_count: 0, review_count: 0 }];
    }
    
    return {
      labels: filteredData.map((item: any) => {
        const monthStr = item.month;
        // YYYY-MM 형식인 경우 월만 추출
        if (monthStr && monthStr.includes('-')) {
          const parts = monthStr.split('-');
          if (parts.length >= 2) {
            return `${parts[0]}년 ${parts[1]}월`;
          }
        }
        return monthStr || 'N/A';
      }),
      datasets: [
        {
          label: '학습 활동',
          data: filteredData.map((item: any) => item.learning_count || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: '복습 활동',
          data: filteredData.map((item: any) => item.review_count || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // 난이도별 기억 유지율 차트 데이터
  const getRetentionRateChartData = () => {
    if (!stats.reviewStats?.retention_stats || !Array.isArray(stats.reviewStats.retention_stats) || stats.reviewStats.retention_stats.length === 0) {
      // 기본 데이터 반환
      return {
        labels: ['난이도 1', '난이도 2', '난이도 3', '난이도 4', '난이도 5'],
        datasets: [
          { 
            label: '기억 유지율 (%)', 
            data: [60, 70, 80, 90, 95], 
            backgroundColor: 'rgba(153, 102, 255, 0.5)' 
          },
          { 
            label: '카드 비율 (%)', 
            data: [20, 20, 20, 20, 20], 
            backgroundColor: 'rgba(255, 159, 64, 0.5)' 
          }
        ]
      };
    }
    
    return {
      labels: stats.reviewStats.retention_stats.map((item: any) => `난이도 ${item.difficulty}`),
      datasets: [
        {
          label: '기억 유지율 (%)',
          data: stats.reviewStats.retention_stats.map((item: any) => (item.estimated_retention || 0) * 100),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        },
        {
          label: '카드 비율 (%)',
          data: stats.reviewStats.retention_stats.map((item: any) => item.percentage || 0),
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // 일별 복습 통계 차트 데이터
  const getDailyReviewChartData = () => {
    if (!stats.reviewStats?.daily_stats || !Array.isArray(stats.reviewStats.daily_stats) || stats.reviewStats.daily_stats.length === 0) {
      // 기본 데이터 생성 (7일)
      const labels = [];
      const dummyData = [];
      const dummyAvg = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toISOString().split('T')[0]);
        dummyData.push(0);
        dummyAvg.push(0);
      }
      
      return {
        labels: labels,
        datasets: [
          {
            label: '복습 횟수',
            data: dummyData,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            type: 'bar',
            yAxisID: 'y'
          },
          {
            label: '평균 난이도',
            data: dummyAvg,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            type: 'line',
            yAxisID: 'y1',
            tension: 0.4,
            fill: false
          }
        ]
      };
    }
    
    // 데이터 필터링 (선택한 시간 범위에 따라)
    let filteredData = [...stats.reviewStats.daily_stats];
    if (timeRange === 'week') {
      filteredData = filteredData.slice(0, 7);
    } else if (timeRange === 'month') {
      filteredData = filteredData.slice(0, 30);
    } else {
      filteredData = filteredData;
    }
    
    return {
      labels: filteredData.map((item: any) => item.date),
      datasets: [
        {
          label: '복습 횟수',
          data: filteredData.map((item: any) => item.count || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          type: 'bar',
          yAxisID: 'y'
        },
        {
          label: '평균 난이도',
          data: filteredData.map((item: any) => item.avg_difficulty || 0),
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          type: 'line',
          yAxisID: 'y1',
          tension: 0.4,
          fill: false
        }
      ]
    };
  };

  // 차트 옵션
  const progressChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };
  
  const activityChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '활동 횟수'
        }
      }
    }
  };
  
  const retentionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '백분율 (%)'
        }
      }
    }
  };
  
  const dailyReviewChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '날짜'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '복습 횟수'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '평균 난이도'
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 1,
        max: 5
      }
    }
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    setRetryCount(0); // 재시도 카운트 초기화하여 데이터 다시 로드
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">학습 통계 및 분석</h1>
          
          <div className="flex space-x-2">
            <Button 
              variant={timeRange === 'week' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              주간
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              월간
            </Button>
            <Button 
              variant={timeRange === 'year' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('year')}
            >
              연간
            </Button>
          </div>
        </div>
        
        {error && (
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
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* 주요 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-2">총 개념</h2>
                <p className="text-3xl font-bold text-primary">
                  {stats.progressStats?.total_concepts || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  학습 완료: {stats.progressStats?.learned_concepts || 0} 
                  ({stats.progressStats?.learning_progress || 0}%)
                </p>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-2">총 카드</h2>
                <p className="text-3xl font-bold text-secondary">
                  {stats.progressStats?.total_cards || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  복습 완료: {stats.progressStats?.reviewed_cards || 0}
                  ({stats.progressStats?.review_progress || 0}%)
                </p>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-2">오늘 복습 예정</h2>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.progressStats?.due_today || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  전체 카드의 {stats.progressStats?.total_cards 
                    ? Math.round((stats.progressStats.due_today / stats.progressStats.total_cards) * 100) 
                    : 0}%
                </p>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-2">총 복습 횟수</h2>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.reviewStats?.total_reviews || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  카드당 평균: {stats.progressStats?.total_cards && stats.reviewStats?.total_reviews
                    ? ((stats.reviewStats.total_reviews / stats.progressStats.total_cards) || 0).toFixed(1)
                    : 0}회
                </p>
              </Card>
            </div>
            
            {/* 진행 상황 차트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ErrorBoundary>
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">학습 진행 현황</h2>
                  <div className="h-64">
                    <Doughnut 
                      data={getLearningProgressChartData()} 
                      options={progressChartOptions}
                    />
                  </div>
                </Card>
              </ErrorBoundary>
              
              <ErrorBoundary>
                <Card className="p-6">
                  <h2 className="text-lg font-medium mb-4">복습 진행 현황</h2>
                  <div className="h-64">
                    <Doughnut 
                      data={getReviewProgressChartData()} 
                      options={progressChartOptions}
                    />
                  </div>
                </Card>
              </ErrorBoundary>
            </div>
            
            {/* 활동 추세 차트 */}
            <ErrorBoundary>
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">학습 활동 추세</h2>
                <div className="h-80">
                  <Bar 
                    data={getMonthlyActivityChartData()} 
                    options={activityChartOptions}
                  />
                </div>
              </Card>
            </ErrorBoundary>
            
            {/* 기억 유지율 차트 */}
            <ErrorBoundary>
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">난이도별 기억 유지율</h2>
                <div className="h-80">
                  <Bar 
                    data={getRetentionRateChartData()} 
                    options={retentionChartOptions}
                  />
                </div>
              </Card>
            </ErrorBoundary>
          </div>
        )}
      </main>
    </div>
  );
};

export default StatsDashboard;