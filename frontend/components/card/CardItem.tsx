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

// components/card/CardForm.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { cardsApi } from '../../api/client';

interface CardFormProps {
  isOpen: boolean;
  onClose: () => void;
  conceptId: number;
  cardId?: number; // 편집 모드일 경우에만 제공
  onSaved: () => void; // 저장 완료 후 콜백
}

const CardForm: React.FC<CardFormProps> = ({ 
  isOpen, 
  onClose, 
  conceptId, 
  cardId,
  onSaved 
}) => {
  const [form, setForm] = useState({
    question: '',
    answer: '',
    explanation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 편집 모드일 경우 기존 카드 데이터 가져오기
  useEffect(() => {
    if (cardId && isOpen) {
      const fetchCardData = async () => {
        try {
          setIsLoading(true);
          const card = await cardsApi.getById(cardId);
          setForm({
            question: card.question,
            answer: card.answer,
            explanation: card.explanation || ''
          });
          setError(null);
        } catch (err) {
          console.error(`카드 ID ${cardId} 가져오기 실패:`, err);
          setError('카드 정보를 불러오는 데 실패했습니다');
        } finally {
          setIsLoading(false);
        }
      };

      fetchCardData();
    } else {
      // 새 카드 생성 모드일 경우 폼 초기화
      setForm({
        question: '',
        answer: '',
        explanation: ''
      });
    }
  }, [cardId, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.question.trim() || !form.answer.trim()) {
      setError('질문과 답변은 필수 입력 항목입니다');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (cardId) {
        // 기존 카드 업데이트
        await cardsApi.update(cardId, form);
      } else {
        // 새 카드 생성
        await cardsApi.create({
          concept_id: conceptId,
          question: form.question,
          answer: form.answer,
          explanation: form.explanation
        });
      }
      
      onSaved();
      onClose();
    } catch (err) {
      console.error('카드 저장 실패:', err);
      setError('카드를 저장하는 데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cardId ? '카드 편집' : '새 카드 추가'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            질문
          </label>
          <textarea
            name="question"
            value={form.question}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            placeholder="학습 카드의 질문을 입력하세요"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            답변
          </label>
          <textarea
            name="answer"
            value={form.answer}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            placeholder="질문에 대한 답변을 입력하세요"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명 (선택사항)
          </label>
          <textarea
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            placeholder="추가 설명이나 해설을 입력하세요 (선택사항)"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {cardId ? '저장' : '추가'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CardForm;