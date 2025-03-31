import React from 'react';

interface ReviewProgressProps {
  current: number;
  total: number;
}

const ReviewProgress: React.FC<ReviewProgressProps> = ({ current, total }) => {
  const progress = Math.round((current / total) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">진행 상황</span>
        <span className="text-sm font-medium text-gray-700">{current} / {total}</span>
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
