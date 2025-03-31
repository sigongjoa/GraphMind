// 대시보드 컴포넌트: LearningProgress.tsx
import React from 'react';
import Card from '../common/Card';

interface LearningProgressProps {
  progress: number;
}

const LearningProgress: React.FC<LearningProgressProps> = ({ progress }) => {
  return (
    <Card title="학습 진행률">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">진행률</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <p className="font-medium">학습한 개념</p>
              <p className="text-xl font-bold text-gray-800">15</p>
            </div>
            <div>
              <p className="font-medium">생성한 카드</p>
              <p className="text-xl font-bold text-gray-800">45</p>
            </div>
            <div>
              <p className="font-medium">복습 완료</p>
              <p className="text-xl font-bold text-gray-800">120</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LearningProgress;
