// components/card/CardList.tsx
import React, { useState, useEffect } from 'react';
import CardItem from './CardItem';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { cardsApi } from '../../api/client';

interface CardListProps {
  conceptId: number;
  onAddCard?: () => void;
  onEditCard?: (id: number) => void;
}

const CardList: React.FC<CardListProps> = ({ conceptId, onAddCard, onEditCard }) => {
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        const data = await cardsApi.getAll(conceptId);
        setCards(data);
        setError(null);
      } catch (err) {
        console.error('카드 목록 가져오기 실패:', err);
        setError(err instanceof Error ? err : new Error('카드를 불러오는 데 실패했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [conceptId]);

  const handleEditCard = (id: number) => {
    if (onEditCard) {
      onEditCard(id);
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      await cardsApi.delete(id);
      // 성공적으로 삭제된 경우 목록에서 제거
      setCards(cards.filter(card => card.id !== id));
    } catch (err) {
      console.error(`카드 ID ${id} 삭제 실패:`, err);
      alert('카드 삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return <Loader size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-600">{error.message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">학습 카드</h2>
        {onAddCard && (
          <Button onClick={onAddCard}>새 카드 추가</Button>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center">
          <p className="text-gray-500 mb-4">이 개념에 대한 학습 카드가 없습니다.</p>
          {onAddCard && (
            <Button onClick={onAddCard}>첫 번째 카드 만들기</Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map(card => (
            <CardItem 
              key={card.id} 
              card={card} 
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardList;