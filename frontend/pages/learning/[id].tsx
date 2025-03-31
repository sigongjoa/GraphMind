// 프론트엔드 학습 모드 페이지: learning/[id].tsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LearningMode from '../../components/learning/LearningMode';

export default function LearningPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <Head>
        <title>학습 모드 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="LLM과 상호작용하며 개념 학습하기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LearningMode />
    </div>
  );
}
