import React from 'react';

const ConceptInfo: React.FC<{ concept: any }> = ({ concept }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800">{concept.name}</h2>
      <p className="text-sm text-gray-600 mt-4">{concept.description}</p>
      <div className="mt-6 flex space-x-4">
        <button className="bg-blue-500 text-white py-2 px-4 rounded-md">편집</button>
        <button className="bg-red-500 text-white py-2 px-4 rounded-md">삭제</button>
      </div>
    </div>
  );
};

export default ConceptInfo;
