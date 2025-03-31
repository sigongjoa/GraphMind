import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Loader from '../common/Loader';
import Button from '../common/Button';
import ErrorBoundary from '../common/ErrorBoundary';
import GraphVisualization from './GraphVisualization';
import { conceptsApi, connectionsApi } from '../../api/client';

const ConceptGraph: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setIsLoading(true);
        
        // 병렬로 데이터 가져오기
        const [concepts, connections] = await Promise.all([
          conceptsApi.getAll(),
          connectionsApi.getAll()
        ]);
        
        // 그래프 데이터 형식으로 변환
        const nodes = concepts.map((concept: any) => ({
          id: concept.id,
          name: concept.name,
          val: 1, // 노드 크기
          color: '#4A6FA5', // 기본 색상
          concept: concept
        }));
        
        const links = connections.map((connection: any) => ({
          source: connection.source_id,
          target: connection.target_id,
          value: connection.strength,
          label: connection.relation
        }));
        
        setGraphData({ nodes, links });
        setError(null);
      } catch (err) {
        console.error('그래프 데이터 로딩 중 오류 발생:', err);
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  const handleNodeClick = (node: any) => {
    setSelectedConcept(node.concept);
  };

  const filterGraph = (filterType: string) => {
    setFilter(filterType);
    // 실제 구현에서는 필터링 로직 추가
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">개념 그래프</h1>
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => filterGraph('all')}
            >
              전체
            </Button>
            <Button 
              variant={filter === 'recent' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => filterGraph('recent')}
            >
              최근 학습
            </Button>
            <Button 
              variant={filter === 'related' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => filterGraph('related')}
            >
              관련 개념
            </Button>
          </div>
        </div>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">데이터 로딩 중 오류가 발생했습니다</h2>
            <p className="text-sm text-red-700">{error.message}</p>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              새로고침
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-lg shadow-md overflow-hidden">
              <ErrorBoundary>
                <div className="h-[600px]">
                  <GraphVisualization 
                    graphData={graphData} 
                    onNodeClick={handleNodeClick} 
                  />
                </div>
              </ErrorBoundary>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-medium mb-4">개념 정보</h2>
              {selectedConcept ? (
                <div>
                  <h3 className="text-xl font-bold mb-2">{selectedConcept.name}</h3>
                  <p className="text-gray-700 mb-4">{selectedConcept.description}</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="primary" 
                      onClick={() => window.location.href = `/concept/${selectedConcept.id}`}
                    >
                      상세 보기
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = `/learning/${selectedConcept.id}`}
                    >
                      학습하기
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">그래프에서 개념을 선택하면 여기에 정보가 표시됩니다.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConceptGraph;
