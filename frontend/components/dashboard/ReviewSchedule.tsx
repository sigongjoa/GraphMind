import React from 'react';
import Link from 'next/link';
import Card from '../common/Card';

interface RecentConceptsProps {
  concepts: any[];
}

const RecentConcepts: React.FC<RecentConceptsProps> = ({ concepts }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">최근 개념</h2>
      
      {concepts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 mb-4">아직 개념이 없습니다.</p>
          <Link href="/graph">
            <a className="text-blue-500 hover:underline">개념 그래프로 이동하여 첫 개념을 추가해보세요</a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concepts.map((concept) => (
            <Link href={`/concept/${concept.id}`} key={concept.id}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-primary mb-2">{concept.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {concept.description || '설명 없음'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentConcepts;