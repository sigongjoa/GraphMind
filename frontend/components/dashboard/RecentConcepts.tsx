// 대시보드 컴포넌트: RecentConcepts.tsx
import React from 'react';
import Link from 'next/link';
import Card from '../common/Card';

interface Concept {
  id: number;
  name: string;
  description: string;
}

interface RecentConceptsProps {
  concepts: Concept[];
}

const RecentConcepts: React.FC<RecentConceptsProps> = ({ concepts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {concepts.map((concept) => (
        <Link key={concept.id} href={`/concept/${concept.id}`}>
          <a>
            <Card hoverable className="h-full">
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{concept.name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {concept.description.length > 100
                    ? `${concept.description.substring(0, 100)}...`
                    : concept.description}
                </p>
                <div className="mt-auto">
                  <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17 12h3v2h-3v3h-2v-3h-3v-2h3V9h2v3zm-5-5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-7 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm14 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zM7 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm16 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default RecentConcepts;
