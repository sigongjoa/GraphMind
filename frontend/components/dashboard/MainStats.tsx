// components/dashboard/MainStats.tsx
import React from 'react';

interface MainStatsProps {
  stats: {
    total: number;
    learned: number;
    reviewed: number;
  };
}

const MainStats: React.FC<MainStatsProps> = ({ stats }) => {
  return (
    <section className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-sm text-gray-500">총 개념</p>
        <p className="text-2xl font-semibold text-blue-600">{stats.total}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">학습 완료</p>
        <p className="text-2xl font-semibold text-green-600">{stats.learned}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500">복습 완료</p>
        <p className="text-2xl font-semibold text-purple-600">{stats.reviewed}</p>
      </div>
    </section>
  );
};

export default MainStats;
