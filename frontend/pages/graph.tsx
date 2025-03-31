// 프론트엔드 그래프 페이지: graph.tsx
import React from 'react';
import Head from 'next/head';
import ConceptGraph from '../components/graph/ConceptGraph';

export default function Graph() {
  return (
    <div>
      <Head>
        <title>개념 그래프 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="개념 그래프 시각화 및 탐색" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ConceptGraph />
    </div>
  );
}
