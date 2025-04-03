// pages/concept/[id]/index.tsx - 개념 상세 페이지
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/common/Header';
import ConceptDetail from '@/components/concept/ConceptDetail';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import { conceptsApi } from '@/api/client';

export default function ConceptPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [concept, setConcept] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      const fetchConcept = async () => {
        try {
          setIsLoading(true);
          const data = await conceptsApi.getById(Number(id));
          setConcept(data);
          setError(null);
        } catch (err) {
          console.error(`개념 ID ${id} 데이터 로드 실패:`, err);
          setError(err instanceof Error ? err : new Error('개념 정보를 불러오는 데 실패했습니다'));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchConcept();
    }
  }, [id]);

  return (
    <>
      <Head>
        <title>
          {concept ? `${concept.name} - 개념 그래프 학습 시스템` : '개념 로드 중...'}
        </title>
        <meta name="description" content="개념 상세 정보 및 학습 자료" />
      </Head>
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-sm text-red-700 mb-4">{error.message}</p>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                다시 시도
              </Button>
              <Button onClick={() => router.push('/')}>
                대시보드로 돌아가기
              </Button>
            </div>
          </div>
        ) : concept ? (
          <ConceptDetail concept={concept} />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">개념을 찾을 수 없습니다</h2>
            <p className="text-sm text-yellow-700 mb-4">요청한 개념을 찾을 수 없습니다. 올바른 ID인지 확인해주세요.</p>
            <Button onClick={() => router.push('/')}>
              대시보드로 돌아가기
            </Button>
          </div>
        )}
      </main>
    </>
  );
}