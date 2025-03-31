// 복습 모드 컴포넌트: ReviewCard.tsx
import React from 'react';
import Button from '../common/Button';

interface Card {
  id: number;
  conceptId: number;
  conceptName: string;
  question: string;
  answer: string;
  explanation?: string;
}

interface ReviewCardProps {
  card: Card;
  showAnswer: boolean;
  onShowAnswer: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ card, showAnswer, onShowAnswer }) => {
  return (
    <div>
      <div className="mb-4">
        <span className="text-sm font-medium text-gray-500">개념: {card.conceptName}</span>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">질문:</h3>
        <p className="text-gray-700 text-lg">{card.question}</p>
      </div>
      
      {!showAnswer ? (
        <div className="flex justify-center">
          <Button onClick={onShowAnswer}>정답 보기</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">정답:</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-gray-700">{card.answer}</p>
            </div>
          </div>
          
          {card.explanation && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">해설:</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">{card.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
