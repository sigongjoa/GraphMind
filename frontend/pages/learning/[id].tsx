// pages/graph.tsx - 개념 그래프 페이지
import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '@/components/common/Header';

// SSR 비활성화로 그래프 컴포넌트 임포트
const ConceptGraph = dynamic(
  () => import('@/components/graph/ConceptGraph'),
  { ssr: false }
);

export default function GraphPage() {
  return (
    <>
      <Head>
        <title>개념 그래프 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="개념 간 연결 관계를 그래프로 시각화" />
      </Head>
      
      <Header />
      
      <ConceptGraph />
    </>
  );
}