
import React from 'react';
import Head from 'next/head';
import GraphManagement from '../components/graph/GraphManagement';

export default function GraphManagementPage() {
  return (
    <>
      <Head>
        <title>개념 그래프 관리 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="개념 그래프 시각화 및 관리" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <GraphManagement />
    </>
  );
}