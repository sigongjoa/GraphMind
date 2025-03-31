import React from 'react';
import Link from 'next/link';
import Button from '../common/Button';

interface ReviewScheduleProps {
  dueReviews: any[];
}

const ReviewSchedule: React.FC<ReviewScheduleProps> = ({ dueReviews }) => {
  if (dueReviews.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">오늘 예정된 복습이 없습니다.</p>
        <Link href="/review">
          <a>
            <Button variant="outline">복습 페이지로 이동</Button>
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-4">오늘 복습할 카드: {dueReviews.length}개</p>
      <ul className="space-y-2 mb-4">
        {dueReviews.slice(0, 3).map((review: any) => (
          <li key={review.id} className="border-l-4 border-secondary pl-3 py-1">
            <p className="font-medium">{review.card?.question || '카드 정보 없음'}</p>
            <p className="text-sm text-gray-600">
              {review.card?.concept?.name || '개념 정보 없음'}
            </p>
          </li>
        ))}
        {dueReviews.length > 3 && (
          <li className="text-sm text-gray-500 italic">
            외 {dueReviews.length - 3}개 더...
          </li>
        )}
      </ul>
      <Link href="/review">
        <a>
          <Button className="w-full">복습 시작하기</Button>
        </a>
      </Link>
    </div>
  );
};

export default ReviewSchedule;
