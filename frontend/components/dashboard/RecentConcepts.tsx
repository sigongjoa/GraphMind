import React from 'react';
import Link from 'next/link';
import Card from '../common/Card';

interface RecentConceptsProps {
  concepts: any[];
}

const RecentConcepts: React.FC<RecentConceptsProps> = ({ concepts }) => {
  if (concepts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600">아직 학습한 개념이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {concepts.map((concept) => (
        <Link key={concept.id} href={`/concept/${concept.id}`}>
          <a className="block">
            <Card className="hover:shadow-md transition-shadow">
              <h3 className="font-medium text-lg mb-1">{concept.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {concept.description}
              </p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>
                  {new Date(concept.created_at).toLocaleDateString('ko-KR')}
                </span>
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  자세히 보기
                </span>
              </div>
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default RecentConcepts;
