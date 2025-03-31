import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface LearningProgressProps {
  concepts: any[];
}

const LearningProgress: React.FC<LearningProgressProps> = ({ concepts }) => {
  // 학습 데이터 예시 (실제로는 API에서 가져온 데이터 사용)
  const learningData = {
    labels: ['1주차', '2주차', '3주차', '4주차'],
    datasets: [
      {
        label: '학습한 개념',
        data: [5, 8, 6, 12],
        backgroundColor: 'rgba(74, 111, 165, 0.7)',
      },
      {
        label: '복습한 개념',
        data: [3, 7, 10, 8],
        backgroundColor: 'rgba(107, 143, 113, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '주간 학습 활동',
      },
    },
  };

  // 학습 통계 계산
  const totalConcepts = concepts.length;
  const learnedConcepts = Math.min(totalConcepts, 25); // 예시 데이터
  const reviewedConcepts = Math.min(totalConcepts, 18); // 예시 데이터
  const learningProgress = totalConcepts > 0 ? Math.round((learnedConcepts / totalConcepts) * 100) : 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-1">총 개념</h3>
          <p className="text-3xl font-bold text-blue-900">{totalConcepts}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800 mb-1">학습 완료</h3>
          <p className="text-3xl font-bold text-green-900">{learnedConcepts}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-800 mb-1">복습 완료</h3>
          <p className="text-3xl font-bold text-purple-900">{reviewedConcepts}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">학습 진행률</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-primary h-4 rounded-full"
            style={{ width: `${learningProgress}%` }}
          ></div>
        </div>
        <p className="text-right mt-1 text-sm text-gray-600">{learningProgress}% 완료</p>
      </div>

      <div className="h-64">
        <Chart type="bar" data={learningData} options={options} />
      </div>
    </div>
  );
};

export default LearningProgress;
