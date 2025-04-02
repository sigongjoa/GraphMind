import React from 'react';

const RelatedConcepts: React.FC<{ relatedConcepts?: any[] }> = ({ relatedConcepts = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800">관련 개념</h3>
      <ul className="space-y-4 mt-4">
        {relatedConcepts && relatedConcepts.length > 0 ? (
          relatedConcepts.map((concept) => (
            <li key={concept.id} className="border rounded p-4 hover:bg-gray-50">
              <p className="font-medium text-blue-700">{concept.name}</p>
              <p className="text-sm text-gray-600">{concept.relation}</p>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500 py-4">
            관련 개념이 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
};

export default RelatedConcepts;