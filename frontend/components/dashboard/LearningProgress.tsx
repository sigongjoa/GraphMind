// components/dashboard/LearningProgress.tsx
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const LearningProgress = () => {
  const data = {
    labels: ['학습 완료', '미학습'],
    datasets: [
      {
        label: '진행률',
        data: [60, 40],
        backgroundColor: ['#3b82f6', '#e5e7eb'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">학습 진행률</h2>
      <div className="flex justify-center">
        <div className="w-40 h-40">
          <Doughnut data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default LearningProgress;