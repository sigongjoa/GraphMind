import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 동적 임포트로 클라이언트 사이드에서만 로드
const GraphComponent = dynamic(() => import('../components/GraphComponent'), {
  ssr: false,
});

const GraphView: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  return (
    <div className="graph-view">
      {/* 헤더 */}
      <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
        <h1 className="text-xl">개념 그래프</h1>
        <div className="user-profile">사용자 프로필</div>
      </header>

      {/* 검색창 및 필터 */}
      <div className="p-4 flex space-x-4">
        <input
          type="text"
          placeholder="개념 검색..."
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <select className="p-2 border border-gray-300 rounded">
          <option>전체</option>
          <option>주제별</option>
        </select>
        <button className="btn-primary">보기 모드 전환</button>
      </div>

      {/* 그래프 시각화 영역 */}
      <div className="p-4 border border-gray-300 rounded h-96">
        <GraphComponent onSelectConcept={setSelectedConcept} />
      </div>

      {/* 선택된 개념 정보 */}
      {selectedConcept && (
        <div className="p-4 border-t border-gray-300">
          <h2 className="text-lg font-semibold">선택된 개념: {selectedConcept}</h2>
          {/* 개념 설명 및 관련 개념 등 */}
          <div className="mt-2">
            <p>개념 설명...</p>
            <p>관련 개념: ...</p>
          </div>
          {/* 학습하기 및 노트 작성 버튼 */}
          <div className="mt-4 flex space-x-4">
            <button className="btn-primary">학습하기</button>
            <button className="btn-secondary">노트 작성</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphView;
