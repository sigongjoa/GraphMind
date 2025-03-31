// 프론트엔드 복습 모드 페이지: review.tsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ReviewMode from '../components/review/ReviewMode';

export default function ReviewPage() {
  const router = useRouter();
  const { concept } = router.query;

  return (
    <div>
      <Head>
        <title>복습 모드 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="간격 반복 기반 개념 복습하기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ReviewMode />
    </div>
  );
}
