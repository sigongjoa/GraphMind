import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import ErrorBoundary from '../common/ErrorBoundary';
import EnhancedGraphVisualization from './EnhancedGraphVisualization';
import { conceptsApi, connectionsApi } from '../../api/client';

const GraphManagement: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [layoutType, setLayoutType] = useState<'force' | 'radial' | 'hierarchical'>('force');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'addNode' | 'addLink' | 'nodeDetail'>('addNode');
  const [newNodeForm, setNewNodeForm] = useState({ name: '', description: '' });
  const [newLinkForm, setNewLinkForm] = useState({ source: '', target: '', relation: '' });
  const [error, setError] = useState<Error | null>(null);

  // 그래프 데이터 로드
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
          val: 5,
          color: '#4A6FA5',
          concept: concept
        }));
        
        const links = connections.map((connection: any) => ({
          id: `${connection.source_id}-${connection.target_id}`,
          source: connection.source_id,
          target: connection.target_id,
          label: connection.relation,
          relation: connection.relation,
          value: connection.strength
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

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  // 노드 추가 핸들러
  const handleNodeAdd = useCallback((x: number, y: number) => {
    setModalType('addNode');
    setIsModalOpen(true);
    // 위치 정보 저장 (나중에 노드 생성 시 사용)
  }, []);

  // 링크 추가 핸들러
  const handleLinkAdd = useCallback((source: any, target: any) => {
    setModalType('addLink');
    setNewLinkForm({
      source: source.id.toString(),
      target: target.id.toString(),
      relation: ''
    });
    setIsModalOpen(true);
  }, []);

  // 노드 드래그 종료 핸들러
  const handleNodeDragEnd = useCallback((node: any, x: number, y: number) => {
    // 위치 정보 저장 (백엔드에 위치 업데이트)
    console.log(`Node ${node.id} moved to position: x=${x}, y=${y}`);
    // 실제 구현에서는 위치 정보를 백엔드에 저장
  }, []);

  // 새 노드 생성 제출 핸들러
  const handleNewNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // 새 개념 생성 API 호출
      const newConcept = await conceptsApi.create({
        name: newNodeForm.name,
        description: newNodeForm.description
      });
      
      // 그래프 데이터 업데이트
      setGraphData(prevData => ({
        nodes: [
          ...prevData.nodes,
          {
            id: newConcept.id,
            name: newConcept.name,
            val: 5,
            color: '#4A6FA5',
            concept: newConcept
          }
        ],
        links: prevData.links
      }));
      
      // 폼 초기화 및 모달 닫기
      setNewNodeForm({ name: '', description: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('개념 생성 중 오류 발생:', err);
      setError(err instanceof Error ? err : new Error('개념 생성 중 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  };

  // 새 링크 생성 제출 핸들러
  const handleNewLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // 새 연결 생성 API 호출
      const newConnection = await connectionsApi.create({
        source_id: parseInt(newLinkForm.source),
        target_id: parseInt(newLinkForm.target),
        relation: newLinkForm.relation,
        strength: 1.0
      });
      
      // 그래프 데이터 업데이트
      setGraphData(prevData => ({
        nodes: prevData.nodes,
        links: [
          ...prevData.links,
          {
            id: `${newConnection.source_id}-${newConnection.target_id}`,
            source: newConnection.source_id,
            target: newConnection.target_id,
            label: newConnection.relation,
            relation: newConnection.relation,
            value: newConnection.strength
          }
        ]
      }));
      
      // 폼 초기화 및 모달 닫기
      setNewLinkForm({ source: '', target: '', relation: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('연결 생성 중 오류 발생:', err);
      setError(err instanceof Error ? err : new Error('연결 생성 중 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h1 className="text-2xl font-bold">개념 그래프 관리</h1>
          
          <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            {/* 검색 */}
            <div className="relative">
              <input
                type="text"
                placeholder="개념 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-60"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {/* 필터 드롭다운 */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">모든 개념</option>
              <option value="recent">최근 학습</option>
              <option value="related">관련 개념</option>
            </select>
            
            {/* 레이아웃 타입 드롭다운 */}
            <select
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value as 'force' | 'radial' | 'hierarchical')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="force">자유 배치</option>
              <option value="radial">방사형</option>
              <option value="hierarchical">계층형</option>
            </select>
            
            {/* 새 개념 추가 버튼 */}
            <Button onClick={() => {
              setModalType('addNode');
              setIsModalOpen(true);
            }}>
              새 개념 추가
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-sm text-red-700">{error.message}</p>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              새로고침
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 그래프 영역 */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md overflow-hidden">
            {isLoading && graphData.nodes.length === 0 ? (
              <div className="flex justify-center items-center h-[600px]">
                <Loader size="lg" />
              </div>
            ) : (
              <ErrorBoundary>
                <div className="h-[600px]">
                  <EnhancedGraphVisualization 
                    graphData={graphData}
                    onNodeClick={handleNodeClick}
                    onNodeAdd={handleNodeAdd}
                    onLinkAdd={handleLinkAdd}
                    onNodeDragEnd={handleNodeDragEnd}
                    editable={true}
                    layoutType={layoutType}
                    filter={filter}
                    searchTerm={searchTerm}
                  />
                </div>
              </ErrorBoundary>
            )}
          </div>
          
          {/* 선택된 개념 정보 패널 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium mb-4">개념 정보</h2>
            {selectedNode ? (
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedNode.name}</h3>
                <p className="text-gray-700 mb-4">{selectedNode.concept?.description || '설명 없음'}</p>
                
                {/* 관련 개념 목록 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">관련 개념</h4>
                  <ul className="space-y-1">
                    {graphData.links
                      .filter((link: any) => 
                        link.source === selectedNode.id || 
                        link.target === selectedNode.id || 
                        link.source.id === selectedNode.id ||
                        link.target.id === selectedNode.id
                      )
                      .map((link: any) => {
                        const isSource = link.source === selectedNode.id || (link.source.id && link.source.id === selectedNode.id);
                        const connectedNodeId = isSource ? (link.target.id || link.target) : (link.source.id || link.source);
                        const connectedNode = graphData.nodes.find((n: any) => n.id === connectedNodeId);
                        
                        return connectedNode ? (
                          <li key={link.id} className="text-sm border-l-2 border-primary pl-2">
                            <span className="font-medium">{connectedNode.name}</span>
                            <span className="text-gray-500 text-xs ml-2">
                              {isSource ? `→ ${link.relation || '연결됨'}` : `← ${link.relation || '연결됨'}`}
                            </span>
                          </li>
                        ) : null;
                      })
                    }
                    
                    {graphData.links.filter((link: any) => 
                      link.source === selectedNode.id || 
                      link.target === selectedNode.id ||
                      link.source.id === selectedNode.id ||
                      link.target.id === selectedNode.id
                    ).length === 0 && (
                      <li className="text-sm text-gray-500">관련 개념이 없습니다.</li>
                    )}
                  </ul>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="primary" 
                    onClick={() => router.push(`/concept/${selectedNode.id}`)}
                  >
                    상세 보기
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/learning/${selectedNode.id}`)}
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
      </main>
      
      {/* 새 개념 추가 모달 */}
      <Modal
        isOpen={isModalOpen && modalType === 'addNode'}
        onClose={() => setIsModalOpen(false)}
        title="새 개념 추가"
        size="md"
      >
        <form onSubmit={handleNewNodeSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="concept-name" className="block text-sm font-medium text-gray-700 mb-1">
                개념 이름
              </label>
              <input
                id="concept-name"
                type="text"
                value={newNodeForm.name}
                onChange={(e) => setNewNodeForm({...newNodeForm, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="개념 이름을 입력하세요"
                required
              />
            </div>
            
            <div>
              <label htmlFor="concept-description" className="block text-sm font-medium text-gray-700 mb-1">
                개념 설명
              </label>
              <textarea
                id="concept-description"
                value={newNodeForm.description}
                onChange={(e) => setNewNodeForm({...newNodeForm, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                placeholder="개념에 대한 설명을 입력하세요"
                required
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </Button>
            <Button 
              type="submit"
              isLoading={isLoading}
            >
              추가
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* 새 연결 추가 모달 */}
      <Modal
        isOpen={isModalOpen && modalType === 'addLink'}
        onClose={() => setIsModalOpen(false)}
        title="새 연결 추가"
        size="md"
      >
        <form onSubmit={handleNewLinkSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="source-concept" className="block text-sm font-medium text-gray-700 mb-1">
                출발 개념
              </label>
              <select
                id="source-concept"
                value={newLinkForm.source}
                onChange={(e) => setNewLinkForm({...newLinkForm, source: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled
              >
                <option value={newLinkForm.source}>
                  {graphData.nodes.find((n: any) => n.id.toString() === newLinkForm.source)?.name || '선택된 개념'}
                </option>
              </select>
            </div>
            
            <div>
              <label htmlFor="target-concept" className="block text-sm font-medium text-gray-700 mb-1">
                도착 개념
              </label>
              <select
                id="target-concept"
                value={newLinkForm.target}
                onChange={(e) => setNewLinkForm({...newLinkForm, target: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled
              >
                <option value={newLinkForm.target}>
                  {graphData.nodes.find((n: any) => n.id.toString() === newLinkForm.target)?.name || '선택된 개념'}
                </option>
              </select>
            </div>
            
            <div>
              <label htmlFor="relation-type" className="block text-sm font-medium text-gray-700 mb-1">
                관계 유형
              </label>
              <select
                id="relation-type"
                value={newLinkForm.relation}
                onChange={(e) => setNewLinkForm({...newLinkForm, relation: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="" disabled>관계 유형 선택</option>
                <option value="하위 개념">하위 개념</option>
                <option value="상위 개념">상위 개념</option>
                <option value="관련 개념">관련 개념</option>
                <option value="선행 개념">선행 개념</option>
                <option value="후행 개념">후행 개념</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </Button>
            <Button 
              type="submit"
              isLoading={isLoading}
              disabled={!newLinkForm.relation}
            >
              추가
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GraphManagement;