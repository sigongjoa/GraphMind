import React from 'react';
import Button from '../common/Button';

interface DifficultyRatingProps {
  onRate: (difficulty: number) => void;
}

const DifficultyRating: React.FC<DifficultyRatingProps> = ({ onRate }) => {
  const difficultyLevels = [
    { value: 1, label: '매우 어려움', color: 'bg-red-500 hover:bg-red-600' },
    { value: 2, label: '어려움', color: 'bg-orange-500 hover:bg-orange-600' },
    { value: 3, label: '보통', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 4, label: '쉬움', color: 'bg-green-500 hover:bg-green-600' },
    { value: 5, label: '매우 쉬움', color: 'bg-blue-500 hover:bg-blue-600' }
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {difficultyLevels.map((level) => (
        <div key={level.value} className="text-center">
          <Button
            className={`w-full ${level.color} text-white`}
            onClick={() => onRate(level.value)}
          >
            {level.value}
          </Button>
          <p className="text-xs mt-1">{level.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DifficultyRating;
