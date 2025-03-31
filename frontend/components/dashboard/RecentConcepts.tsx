// components/dashboard/RecentConcepts.tsx
import React from 'react';

const RecentConcepts = () => {
  const recentConcepts = [
    { id: 1, name: '소프트웨어 공학', description: '소프트웨어의 생명주기 전반을 다루는 학문' },
    { id: 2, name: '유지보수', description: '인도된 소프트웨어의 결함 수정 및 환경 적응 과정' },
    { id: 3, name: '요구사항 분석', description: '해결해야 할 문제를 정의하고 문서화하는 과정' },
    { id: 4, name: '집합론', description: '집합 개념과 그 연산을 연구하는 수학 분야' },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">최근 학습한 개념</h2>
      <ul className="space-y-3">
        {recentConcepts.map((concept) => (
          <li key={concept.id} className="border rounded p-4 hover:bg-gray-50">
            <p className="font-medium text-blue-700">{concept.name}</p>
            <p className="text-sm text-gray-600">{concept.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentConcepts;
