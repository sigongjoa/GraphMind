// 복습 모드 컴포넌트: DifficultyRating.tsx
import React from 'react';

interface DifficultyRatingProps {
  onRate: (rating: number) => void;
}

const DifficultyRating: React.FC<DifficultyRatingProps> = ({ onRate }) => {
  const ratings = [
    { value: 1, label: '매우 어려움', description: '전혀 기억나지 않았음' },
    { value: 2, label: '어려움', description: '많이 생각해야 기억남' },
    { value: 3, label: '보통', description: '약간의 노력으로 기억함' },
    { value: 4, label: '쉬움', description: '쉽게 기억함' },
    { value: 5, label: '매우 쉬움', description: '완벽하게 기억함' }
  ];

  return (
    <div className="flex flex-wrap justify-between gap-2">
      {ratings.map((rating) => (
        <button
          key={rating.value}
          onClick={() => onRate(rating.value)}
          className="flex-1 min-w-[100px] bg-white border border-gray-300 rounded-md p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        >
          <div className="text-lg font-bold text-center mb-1">{rating.value}</div>
          <div className="text-sm font-medium text-center mb-1">{rating.label}</div>
          <div className="text-xs text-gray-500 text-center">{rating.description}</div>
        </button>
      ))}
    </div>
  );
};

export default DifficultyRating;
