// components/dashboard/LearningProgress.tsx - 개선된 학습 진행 컴포넌트
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Card from '../common/Card';

ChartJS.register(ArcElement, Tooltip, Legend);

interface LearningProgressProps {
  totalConcepts: number;
  learnedConcepts: number;
  totalCards: number;
  reviewedCards: number;
}

const LearningProgress: React.FC<LearningProgressProps> = ({
  totalConcepts,
  learnedConcepts,
  totalCards,
  reviewedCards
}) => {
  const conceptProgressData = {
    labels: ['학습 시작', '미학습'],
    datasets: [
      {
        label: '개념 진행률',
        data: [learnedConcepts, Math.max(0, totalConcepts - learnedConcepts)],
        backgroundColor: ['#3b82f6', '#e5e7eb'],
        borderWidth: 1,
      },
    ],
  };
  
  const cardProgressData = {
    labels: ['복습 시작', '미복습'],
    datasets: [
      {
        label: '카드 진행률',
        data: [reviewedCards, Math.max(0, totalCards - reviewedCards)],
        backgroundColor: ['#10b981', '#e5e7eb'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">학습 진행 상황</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm text-center text-gray-600 mb-2">개념 진행률</h3>
          <div className="w-48 h-48 mx-auto">
            <Doughnut data={conceptProgressData} options={options} />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {totalConcepts > 0 ? 
              `${Math.round((learnedConcepts / totalConcepts) * 100)}% 진행` : 
              '진행 데이터 없음'}
          </p>
        </div>
        <div>
          <h3 className="text-sm text-center text-gray-600 mb-2">카드 진행률</h3>
          <div className="w-48 h-48 mx-auto">
            <Doughnut data={cardProgressData} options={options} />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {totalCards > 0 ? 
              `${Math.round((reviewedCards / totalCards) * 100)}% 진행` : 
              '진행 데이터 없음'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default LearningProgress;