// 개념 그래프 컴포넌트: ConceptGraph.tsx
import React, { useEffect, useState, useRef } from 'react';
import Header from '../common/Header';
import SearchBar from '../common/SearchBar';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import GraphVisualization from './GraphVisualization';

interface ConceptGraphProps {
  username?: string;
}

interface ConceptNode {
  id: number;
  name: string;
  description: string;
}

interface ConnectionEdge {
  id: number;
  source: number;
  target: number;
  relation: string;
  strength: number;
}

interface GraphData {
  nodes: ConceptNode[];
  edges: ConnectionEdge[];
}

const ConceptGraph: React.FC<ConceptGraphProps> = ({ username = '사용자' }) => {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [filter, setFilter] = useState('전체');
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  useEffect(() => {
    // 실제 구현에서는 API에서 데이터를 가져옵니다
    const fetchGraphData = async () => {
      try {
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 샘플 데이터
        const sampleData: GraphData = {
          nodes: [
            { id: 1, name: '소프트웨어 공학', description: '소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문' },
            { id: 2, name: '요구사항 분석', description: '소프트웨어가 해결해야 할 문제를 이해하고 문서화하는 과정' },
            { id: 3, name: '유지보수', description: '소프트웨어를 인도한 후에 결함을 수정하고, 성능을 개선하며, 변화된 환경에 적응시키는 과정' },
            { id: 4, name: '소프트웨어 테스팅', description: '소프트웨어가 요구사항을 충족하는지 확인하고 결함을 식별하는 과정' },
            { id: 5, name: '소프트웨어 설계', description: '요구사항을 소프트웨어 구조로 변환하는 과정' }
          ],
          edges: [
            { id: 1, source: 2, target: 1, relation: '하위 개념', strength: 0.8 },
            { id: 2, source: 3, target: 1, relation: '하위 개념', strength: 0.7 },
            { id: 3, source: 4, target: 1, relation: '하위 개념', strength: 0.9 },
            { id: 4, source: 5, target: 1, relation: '하위 개념', strength: 0.8 }
          ]
        };
        
        setGraphData(sampleData);
        setLoading(false);
      } catch (error) {
        console.error('그래프 데이터 로딩 실패:', error);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  const handleNodeClick = (node: ConceptNode) => {
    setSelectedNode(node);
  };

  const handleSearch = (query: string) => {
    // 실제 구현에서는 검색 로직을 구현합니다
    console.log('검색어:', query);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleViewModeChange = (mode: 'graph' | 'list') => {
    setViewMode(mode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header username={username} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader size="lg" text="그래프 데이터를 불러오는 중..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">개념 그래프</h1>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-64">
              <SearchBar onSearch={handleSearch} placeholder="개념 검색..." />
            </div>
            
            <div className="flex space-x-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="전체">전체</option>
                <option value="소프트웨어 공학">소프트웨어 공학</option>
                <option value="집합론">집합론</option>
                <option value="알고리즘">알고리즘</option>
              </select>
              
              <div className="flex rounded-md shadow-sm">
                <button
                  className={`px-3 py-2 border border-gray-300 rounded-l-md ${
                    viewMode === 'graph' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => handleViewModeChange('graph')}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 12h3v2h-3v3h-2v-3h-3v-2h3V9h2v3zm-5-5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-7 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm14 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z" />
                  </svg>
                </button>
                <button
                  className={`px-3 py-2 border border-gray-300 rounded-r-md ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => handleViewModeChange('list')}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="h-[500px] w-full">
            {viewMode === 'graph' ? (
              <GraphVisualization
                nodes={graphData.nodes}
                edges={graphData.edges}
                onNodeClick={handleNodeClick}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {graphData.nodes.map((node) => (
                  <Card
                    key={node.id}
                    hoverable
                    onClick={() => handleNodeClick(node)}
                    className={selectedNode?.id === node.id ? 'border-2 border-primary' : ''}
                  >
                    <h3 className="text-lg font-medium text-gray-800 mb-2">{node.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {node.description.length > 100
                        ? `${node.description.substring(0, 100)}...`
                        : node.description}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {selectedNode && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">선택된 개념: {selectedNode.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="개념 설명">
                <p className="text-gray-700">{selectedNode.description}</p>
              </Card>
              
              <Card title="관련 개념">
                <div className="space-y-2">
                  {graphData.edges
                    .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
                    .map(edge => {
                      const relatedNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                      const relatedNode = graphData.nodes.find(node => node.id === relatedNodeId);
                      
                      if (!relatedNode) return null;
                      
                      return (
                        <div
                          key={edge.id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => handleNodeClick(relatedNode)}
                        >
                          <div className="h-2 w-2 rounded-full bg-primary mr-3"></div>
                          <span className="text-gray-700">{relatedNode.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({edge.relation})</span>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <Link href={`/learning/${selectedNode.id}`}>
                <a>
                  <Button>학습하기</Button>
                </a>
              </Link>
              
              <Link href={`/concept/${selectedNode.id}/notes/new`}>
                <a>
                  <Button variant="outline">노트 작성</Button>
                </a>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConceptGraph;
