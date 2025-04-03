// pages/graph.tsx
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
// ❌ Header는 삭제하세요 (Layout에서 이미 포함되므로)
// import Header from '@/components/common/Header';

const GraphComponent = dynamic(() => import('@/components/GraphComponent'), {
  ssr: false,
});

export default function GraphPage() {
  const [selectedNode, setSelectedNode] = useState<{ id: string } | null>(null);

  const handleNodeClick = (node: { id: string }) => {
    setSelectedNode(node);
  };

  return (
    <>
      <Head>
        <title>개념 그래프</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">개념 그래프</h1>

        {/* 중간: 좌(그래프) + 우(개념 정보) */}
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* 왼쪽 그래프 영역 */}
          <div className="bg-white rounded shadow h-[600px] overflow-hidden">
            <GraphComponent onNodeClick={handleNodeClick} />
          </div>

          {/* 오른쪽 개념 정보 패널 */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-2">개념 정보</h2>
            {selectedNode ? (
              <div>
                <p className="text-blue-600 font-medium mb-2">{selectedNode.id}</p>
                <p className="text-sm text-gray-600">
                  여기에 {selectedNode.id}에 대한 상세 정보를 표시
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                그래프에서 개념을 선택하면 이 영역에 상세 정보가 표시됩니다.
              </p>
            )}
          </div>
        </div>

        {/* 하단 영역: 최근 학습 카드 */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">최근 학습</h2>
          <p className="text-sm text-gray-600">
            아직 구현된 내용이 없습니다. 여기에 최근 학습 기록을 표시할 수 있어요.
          </p>
        </div>
      </main>
    </>
  );
}
