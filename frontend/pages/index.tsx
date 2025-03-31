// pages/index.tsx
import React from 'react';
import Head from 'next/head';
import Dashboard from '../components/dashboard/Dashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>개념 그래프 학습 시스템</title>
        <meta name="description" content="개념 그래프 기반 자기 주도 학습 시스템" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Dashboard />
    </>
  );
}
