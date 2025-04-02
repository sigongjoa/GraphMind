import React from 'react';

const ConceptCards: React.FC<{ cards?: any[] }> = ({ cards = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800">학습 카드</h3>
      <ul className="space-y-4 mt-4">
        {cards && cards.length > 0 ? (
          cards.map((card) => (
            <li key={card.id} className="border rounded p-4 hover:bg-gray-50">
              <p className="font-medium text-blue-700">{card.question}</p>
              <p className="text-sm text-gray-600">{card.answer}</p>
              <div className="flex space-x-4 mt-4">
                <button className="bg-green-500 text-white py-2 px-4 rounded-md">상세보기</button>
                <button className="bg-yellow-500 text-white py-2 px-4 rounded-md">편집</button>
              </div>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500 py-4">
            아직 학습 카드가 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
};

export default ConceptCards;