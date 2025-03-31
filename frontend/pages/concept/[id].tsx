// 프론트엔드 개념 상세 페이지: concept/[id].tsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ConceptDetail from '../../components/concept/ConceptDetail';

export default function ConceptPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <Head>
        <title>개념 상세 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="개념 상세 정보 및 학습 자료" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ConceptDetail />
    </div>
  );
}
