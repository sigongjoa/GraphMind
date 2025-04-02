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
import axios from 'axios';

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

// 통계 API 엔드포인트 URL
const STATS_API = "http://localhost:8000/api/stats";

const StatsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<any>({
    learningStats: null,
    progressStats: null,
    reviewStats: null
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // 통계 데이터 로드
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // 병렬로 다양한 통계 데이터 로드
        const [learningStats, progressStats, reviewStats] = await Promise.all([
          axios.get(`${STATS_API}/learning-stats`).then(res => res.data),
          axios.get(`${STATS_API}/progress-stats`).then(res => res.data),
          axios.get(`${STATS_API}/review-stats`).then(res => res.data)
        ]);
        
        setStats({
          learningStats,
          progressStats,
          reviewStats
        });
        
        setError(null);
      } catch (err) {
        console.error('통계 데이터 로딩 중 오류 발생:', err);
        setError(err instanceof Error ? err : new Error('통계 데이터 로딩 중 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // 학습 진행 도넛 차트 데이터
  const getLearningProgressChartData = () => {
    if (!stats.progressStats) return { datasets: [] };
    
    return {
      labels: ['학습 완료', '미학습'],
      datasets: [
        {
          data: [
            stats.progressStats.learned_concepts,
            stats.progressStats.total_concepts - stats.progressStats.learned_concepts
          ],
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
    if (!stats.progressStats) return { datasets: [] };
    
    return {
      labels: ['복습 완료', '미복습'],
      datasets: [
        {
          data: [
            stats.progressStats.reviewed_cards,
            stats.progressStats.total_cards - stats.progressStats.reviewed_cards
          ],
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
    if (!stats.progressStats?.monthly_activities) return { datasets: [] };
    
    // 데이터 필터링 (선택한 시간 범위에 따라)
    let filteredData;
    if (timeRange === 'week') {
      filteredData = stats.progressStats.monthly_activities.slice(0, 1);
    } else if (timeRange === 'month') {
      filteredData = stats.progressStats.monthly_activities.slice(0, 3);
    } else {
      filteredData = stats.progressStats.monthly_activities.slice(0, 12);
    }
    
    // 최신 데이터가 오른쪽에 오도록 순서 조정
    filteredData = filteredData.reverse();
    
    return {
      labels: filteredData.map((item: any) => item.month),
      datasets: [
        {
          label: '학습 활동',
          data: filteredData.map((item: any) => item.learning_count),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: '복습 활동',
          data: filteredData.map((item: any) => item.review_count),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // 난이도별 기억 유지율 차트 데이터
  const getRetentionRateChartData = () => {
    if (!stats.reviewStats?.retention_stats) return { datasets: [] };
    
    return {
      labels: stats.reviewStats.retention_stats.map((item: any) => `난이도 ${item.difficulty}`),
      datasets: [
        {
          label: '기억 유지율 (%)',
          data: stats.reviewStats.retention_stats.map((item: any) => item.estimated_retention * 100),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        },
        {
          label: '카드 비율 (%)',
          data: stats.reviewStats.retention_stats.map((item: any) => item.percentage),
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // 일별 복습 통계 차트 데이터
  const getDailyReviewChartData = () => {
    if (!stats.reviewStats?.daily_stats) return { datasets: [] };
    
    // 데이터 필터링 (선택한 시간 범위에 따라)
    let filteredData;
    if (timeRange === 'week') {
      filteredData = stats.reviewStats.daily_stats.slice(0, 7);
    } else if (timeRange === 'month') {
      filteredData = stats.reviewStats.daily_stats.slice(0, 30);
    } else {
      filteredData = stats.reviewStats.daily_stats;
    }
    
    return {
      labels: filteredData.map((item: any) => item.date),
      datasets: [
        {
          label: '복습 횟수',
          data: filteredData.map((item: any) => item.count),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          type: 'bar',
          yAxisID: 'y'
        },
        {
          label: '평균 난이도',
          data: filteredData.map((item: any) => item.avg_difficulty),
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
            <p className="text-sm text-red-700">{error.message}</p>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              새로고침
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
                    ? (stats.reviewStats.total_reviews / stats.progressStats.total_cards).toFixed(1)
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
            
            {/* 일별 복습 통계 차트 */}
            <ErrorBoundary>
              <Card className="p-6">
                <h2 className="text-lg font-medium mb-4">일별 복습 통계</h2>
                <div className="h-80">
                  <Line 
                    data={getDailyReviewChartData()} 
                    options={dailyReviewChartOptions}
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