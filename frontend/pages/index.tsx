// pages/index.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '@/components/common/Header';
import MainStats from '@/components/dashboard/MainStats';
import LearningProgress from '@/components/dashboard/LearningProgress';
import TodayReview from '@/components/dashboard/TodayReview';
import RecentConcepts from '@/components/dashboard/RecentConcepts';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    learned: 0,
    reviewed: 0,
  });

  useEffect(() => {
    // TODO: fetch real data
    setStats({ total: 12, learned: 6, reviewed: 3 });
  }, []);

  return (
    <>
      <Head>
        <title>개념 그래프 학습 시스템</title>
      </Head>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <h1 className="text-2xl font-bold mb-6">>대시보드</h1>

        <MainStats stats={stats} />

        <LearningProgress />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TodayReview />
          <RecentConcepts />
        </div>
      </main>
    </>
  );
}
