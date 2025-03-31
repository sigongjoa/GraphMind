import React from 'react';
import Card from '../common/Card';

interface ReviewCardProps {
  card: any;
  isAnswerVisible: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  card, 
  isAnswerVisible 
}) => {
  if (!card) {
    return (
      <Card className="h-64 flex items-center justify-center">
        <p className="text-gray-500">카드 정보를 불러올 수 없습니다.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-2">질문</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-gray-800">{card.question}</p>
        </div>
      </Card>
      
      {isAnswerVisible && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">정답</h3>
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-gray-800">{card.answer}</p>
          </div>
          
          {card.explanation && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">해설</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-gray-800">{card.explanation}</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <p>개념: {card.concept?.name || '알 수 없음'}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReviewCard;
