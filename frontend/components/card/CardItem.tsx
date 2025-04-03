// components/card/CardItem.tsx
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface CardItemProps {
  card: {
    id: number;
    question: string;
    answer: string;
    explanation?: string;
    concept_id?: number;
    concept?: {
      name: string;
    };
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card className="mb-4">
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">문제</h3>
        <p className="bg-gray-50 p-3 rounded mb-4">{card.question}</p>
        
        {!showAnswer ? (
          <Button onClick={() => setShowAnswer(true)}>정답 보기</Button>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2">정답</h3>
            <p className="bg-green-50 p-3 rounded mb-4">{card.answer}</p>
            
            {card.explanation && (
              <>
                <h3 className="text-lg font-medium mb-2">설명</h3>
                <p className="bg-blue-50 p-3 rounded mb-4">{card.explanation}</p>
              </>
            )}

            {card.concept && (
              <p className="text-sm text-gray-500 mt-2">
                개념: {card.concept.name}
              </p>
            )}
            
            <Button onClick={() => setShowAnswer(false)} className="mt-2">숨기기</Button>
          </>
        )}
      </div>
      
      {(onEdit || onDelete) && (
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(card.id)}>
              편집
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:bg-red-50"
              onClick={() => {
                if (window.confirm('이 카드를 삭제하시겠습니까?')) {
                  onDelete(card.id);
                }
              }}
            >
              삭제
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default CardItem;