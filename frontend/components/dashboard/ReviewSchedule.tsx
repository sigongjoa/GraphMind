// 대시보드 컴포넌트: ReviewSchedule.tsx
import React from 'react';
import Link from 'next/link';
import Card from '../common/Card';
import Button from '../common/Button';

interface DueCard {
  id: number;
  title: string;
}

interface ReviewScheduleProps {
  dueCards: DueCard[];
}

const ReviewSchedule: React.FC<ReviewScheduleProps> = ({ dueCards }) => {
  return (
    <Card 
      title="복습 예정 카드" 
      footer={
        <Link href="/review">
          <a>
            <Button variant="outline" size="sm" fullWidth>
              복습 시작하기
            </Button>
          </a>
        </Link>
      }
    >
      <div className="space-y-2">
        {dueCards.length > 0 ? (
          dueCards.map((card) => (
            <div 
              key={card.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded-md"
            >
              <div className="h-2 w-2 rounded-full bg-primary mr-3"></div>
              <span className="text-gray-700">{card.title}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">오늘 복습할 카드가 없습니다.</p>
        )}
      </div>
    </Card>
  );
};

export default ReviewSchedule;
