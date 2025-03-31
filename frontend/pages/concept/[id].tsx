import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/common/Header';
import ConceptDetail from '@/components/concept/ConceptDetail';
import { conceptsApi } from '@/api/client';

export default function ConceptPage() {
  const router = useRouter();
  const { id } = router.query;  // URL 파라미터에서 id 받기
  const [concept, setConcept] = useState<any>(null);  // 개념 데이터 상태

  useEffect(() => {
    if (id) {
      // 개념 API를 호출하여 데이터를 가져옴
      conceptsApi.getById(Number(id))
        .then(response => {
          setConcept(response);
        })
        .catch(error => {
          console.error('Error fetching concept:', error);
        });
    }
  }, [id]);

  if (!concept) {
    return <div>Loading...</div>;  // 로딩 중일 때
  }

  return (
    <>
      <Head>
        <title>{concept.name} - 개념 그래프 학습 시스템</title>
      </Head>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <ConceptDetail concept={concept} />
      </main>
    </>
  );
}
