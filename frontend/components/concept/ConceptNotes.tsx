import React from 'react';

const ConceptNotes: React.FC<{ notes: any[] }> = ({ notes }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800">내 노트</h3>
      <ul className="space-y-4 mt-4">
        {notes.map((note) => (
          <li key={note.id} className="border rounded p-4 hover:bg-gray-50">
            <p className="font-medium text-blue-700">{note.title}</p>
            <p className="text-sm text-gray-600">{note.content}</p>
            <div className="flex space-x-4 mt-4">
              <button className="bg-green-500 text-white py-2 px-4 rounded-md">상세보기</button>
              <button className="bg-yellow-500 text-white py-2 px-4 rounded-md">편집</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConceptNotes;
