import Head from 'next/head';
import dynamic from 'next/dynamic';

console.log("✅ GraphManagement 컴포넌트 렌더링 시작");

const GraphManagement = dynamic(
  
  () => import('../components/graph/GraphManagement'),
  { ssr: false }
);

export default function GraphManagementPage() {
  return (
    <>
      <Head>
        <title>개념 그래프 관리 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="개념 그래프 시각화 및 관리" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-background">
        <h1>✅ 이게 보이면 렌더링 OK</h1>
        ...
      </div>
      <GraphManagement />
    </>
  );
}