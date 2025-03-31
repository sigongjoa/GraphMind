// pages/graph.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Header from '@/components/common/Header';

const GraphComponent = dynamic(() => import('@/components/GraphComponent'), {
  ssr: false,
});

export default function GraphPage() {
  return (
    <>
      <Head>
        <title>개념 그래프</title>
      </Head>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">개념 그래프</h1>

        <div className="flex gap-6">
          {/* 그래프 영역 */}
          <div className="flex-1 bg-white rounded-xl shadow p-4 h-[600px]">
            <GraphComponent />
          </div>

          {/* 오른쪽 정보 카드 */}
          <div className="w-80 bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-lg mb-2">개념 정보</h2>
            <p className="text-sm text-gray-600">그래프에서 개념을 선택하면 여기에 정보가 표시됩니다.</p>
          </div>
        </div>

        {/* 필터 버튼 (선택) */}
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded bg-blue-100 text-blue-800">전체</button>
          <button className="px-3 py-1 rounded bg-gray-100 text-gray-800">최근 학습</button>
          <button className="px-3 py-1 rounded bg-gray-100 text-gray-800">관련 개념</button>
        </div>
      </main>
    </>
  );
}
