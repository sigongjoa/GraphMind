// components/dashboard/TodayReview.tsx
import React from 'react';

const TodayReview = () => {
  const reviewCards = [
    { id: 1, title: '소프트웨어 공학' },
    { id: 2, title: '요구사항 분석' },
    { id: 3, title: '유지보수' },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘의 복습 카드</h2>
      <ul className="space-y-2">
        {reviewCards.map((card) => (
          <li key={card.id} className="border rounded px-4 py-2 hover:bg-gray-50">
            {card.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodayReview;