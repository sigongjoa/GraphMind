// 복습 모드 컴포넌트: ReviewProgress.tsx
import React from 'react';

interface ReviewProgressProps {
  current: number;
  total: number;
  progress: number;
}

const ReviewProgress: React.FC<ReviewProgressProps> = ({ current, total, progress }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-gray-800">오늘의 복습 카드: {current}/{total}</h2>
        <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ReviewProgress;
