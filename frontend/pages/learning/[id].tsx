import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import UpdatedLearningMode from '@/components/learning/UpdatedLearningMode';
import Header from '@/components/common/Header';
import LearningMode from '@/components/learning/LearningMode';

export default function LearningPage() {
  const router = useRouter();
  const { id } = router.query;
  const conceptId = typeof id === 'string' ? parseInt(id, 10) : undefined;

  return (
    <>
      <Head>
        <title>학습 모드 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="AI와의 상호작용을 통한 개념 학습" />
      </Head>
      
      <LearningMode />
    </>
  );
}