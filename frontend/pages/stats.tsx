import React from 'react';
import Head from 'next/head';
import StatsDashboard from '../components/stats/StatsDashboard';

export default function StatsPage() {
  return (
    <>
      <Head>
        <title>학습 통계 및 분석 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="학습 성과 및 복습 효율성 분석" />
      </Head>
      <StatsDashboard />
    </>
  );
}