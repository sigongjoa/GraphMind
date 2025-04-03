// components/concept/ConceptDetail.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ConceptInfo from './ConceptInfo';
import RelatedConcepts from './RelatedConcepts';
import CardList from '../card/CardList';
import CardForm from '../card/CardForm';
import Button from '../common/Button';

interface ConceptDetailProps {
  concept: any;
}

const ConceptDetail: React.FC<ConceptDetailProps> = ({ concept }) => {
  const router = useRouter();
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | undefined>(undefined);
  const [refreshCards, setRefreshCards] = useState(0);

  const handleAddCard = () => {
    setSelectedCardId(undefined); // 새 카드 모드
    setIsCardFormOpen(true);
  };

  const handleEditCard = (id: number) => {
    setSelectedCardId(id); // 편집 모드
    setIsCardFormOpen(true);
  };

  const handleCardSaved = () => {
    // 카드 목록 새로고침 트리거
    setRefreshCards(prev => prev + 1);
  };

  const handleStartLearning = () => {
    router.push(`/learning/${concept.id}`);
  };

  const handleStartReview = () => {
    router.push(`/review?concept=${concept.id}`);
  };

  return (
    <div className="space-y-8">
      <ConceptInfo concept={concept} />
      
      <RelatedConcepts relatedConcepts={concept.related_concepts} />
      
      {/* 카드 목록 컴포넌트 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <CardList 
          key={refreshCards} // 새로고침을 위한 key
          conceptId={concept.id} 
          onAddCard={handleAddCard}
          onEditCard={handleEditCard}
        />
      </div>
      
      {/* 학습 및 복습 버튼 */}
      <div className="flex flex-wrap gap-4 mt-6">
        <Button onClick={handleStartLearning}>
          이 개념 학습하기
        </Button>
        <Button variant="outline" onClick={handleStartReview}>
          이 개념 복습하기
        </Button>
      </div>
      
      {/* 카드 생성/편집 모달 */}
      <CardForm
        isOpen={isCardFormOpen}
        onClose={() => setIsCardFormOpen(false)}
        conceptId={concept.id}
        cardId={selectedCardId}
        onSaved={handleCardSaved}
      />
    </div>
  );
};

export default ConceptDetail;