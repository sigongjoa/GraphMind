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