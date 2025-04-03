// components/dashboard/TodayReview.tsx - 개선된 오늘의 복습 컴포넌트
import React from 'react';
import Link from 'next/link';
import Card from '../common/Card';
import Button from '../common/Button';

interface TodayReviewProps {
  dueReviews: any[];
}

const TodayReview: React.FC<TodayReviewProps> = ({ dueReviews }) => {
  return (
    <Card className="p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘의 복습</h2>
      
      {dueReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 text-center mb-4">오늘 예정된 복습이 없습니다.</p>
          <Link href="/review">
            <Button variant="outline">복습 페이지로 이동</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            오늘 복습할 카드: <span className="font-semibold">{dueReviews.length}개</span>
          </p>
          
          <div className="max-h-40 overflow-y-auto space-y-2">
            {dueReviews.slice(0, 5).map((review, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-3 py-1 text-sm">
                카드 ID: {review.card_id}
              </div>
            ))}
            
            {dueReviews.length > 5 && (
              <p className="text-gray-500 italic text-sm">
                외 {dueReviews.length - 5}개 더...
              </p>
            )}
          </div>
          
          <div className="mt-4">
            <Link href="/review">
              <Button className="w-full">복습 시작하기</Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TodayReview;