// frontend/components/graph/GraphManagement.tsx

console.log("✅ GraphManagement 컴포넌트 렌더링 시작");
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
  const [retryCount, setRetryCount] = useState(0);

  // 그래프 데이터 로드
  useEffect(() => {
    alert("🔥 useEffect 진입됨");
    console.log("🔥 useEffect 실행됨");
    console.log("🔥 useEffect 실행됨, retryCount:", retryCount);
    console.log("🧪 isLoading:", isLoading);
    console.log("🧪 노드 수:", graphData.nodes?.length);
    console.log("🧪 링크 수:", graphData.links?.length);

    const fetchGraphData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 병렬로 데이터 가져오기
        const [concepts, connections] = await Promise.all([
          conceptsApi.getAll(),
          connectionsApi.getAll()
        ]);

        console.log("✅ 개념 응답:", concepts);
        console.log("✅ 연결 응답:", connections);
        
        

        // API 응답 유효성 검사
        if (!Array.isArray(concepts)) {
          throw new Error('개념 데이터가 올바른 형식이 아닙니다.');
        }
        
        if (!Array.isArray(connections)) {
          throw new Error('연결 데이터가 올바른 형식이 아닙니다.');
        }
        
        // 그래프 데이터 형식으로 변환
        const nodes = concepts.map((concept: any) => ({
          id: concept.id,
          name: concept.name,
          val: 5,
          color: '#4A6FA5',
          concept: concept
        }));
        
        // 연결 데이터 검증 및 변환
        const links = connections.map((connection: any) => {
          // 유효한 연결인지 확인 (source_id와 target_id가 존재하는 노드인지)
          const sourceExists = nodes.some((node: any) => node.id === connection.source_id);
          const targetExists = nodes.some((node: any) => node.id === connection.target_id);
          
          if (!sourceExists || !targetExists) {
            console.warn(`유효하지 않은 연결 건너뛰기: ${connection.id}`);
            return null;
          }
          
          return {
            id: `${connection.source_id}-${connection.target_id}`,
            source: connection.source_id,
            target: connection.target_id,
            label: connection.relation,
            relation: connection.relation,
            value: connection.strength || 1
          };
        }).filter(Boolean); // null 값 제거
        
        setGraphData({ nodes, links });
      } catch (err) {
        console.error('그래프 데이터 로딩 중 오류 발생:', err);
        setError(err instanceof Error ? err : new Error('데이터를 불러오는 중 오류가 발생했습니다'));
        
        // 자동 재시도 로직 (최대 3회)
        if (retryCount < 3) {
          console.log(`데이터 로딩 재시도 중... (${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000); // 2초 후 재시도
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, [retryCount]);

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((node: any) => {
    console.log('노드 클릭됨:', node); // 추가적인 로깅
    setSelectedNode(node);
    
    // 여기서 modalType을 'nodeDetail'로 설정하여 패널 표시
    setModalType('nodeDetail');
    setIsModalOpen(true);
  }, []);

  // 노드 추가 핸들러
  const handleNodeAdd = useCallback((x: number, y: number) => {
    console.log('새 노드 위치:', x, y);
    setModalType('addNode');
    setIsModalOpen(true);
  }, []);

  // 링크 추가 핸들러
  const handleLinkAdd = useCallback((source: any, target: any) => {
    console.log('Link Add - Source:', source);
    console.log('Link Add - Target:', target);
  
    // 노드 ID 안전하게 추출
    const sourceId = source.id || source.concept?.id;
    const targetId = target.id || target.concept?.id;
  
    if (!sourceId || !targetId) {
      console.error('Invalid source or target node');
      return;
    }
  
    setModalType('addLink');
    setNewLinkForm({
      source: sourceId.toString(),
      target: targetId.toString(),
      relation: ''
    });
    setIsModalOpen(true);
  }, []);

  // 노드 드래그 종료 핸들러
  const handleNodeDragEnd = useCallback((node: any, x: number, y: number) => {
    console.log(`노드 ${node.id} 이동: x=${x}, y=${y}`);
    // 필요시 위치 정보 저장 로직 추가
  }, []);

  // 새 노드 생성 제출 핸들러
  const handleNewNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNodeForm.name.trim()) {
      alert('개념 이름을 입력하세요.');
      return;
    }
    
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
      
      // 성공 메시지
      alert('새 개념이 추가되었습니다.');
      
      // 폼 초기화 및 모달 닫기
      setNewNodeForm({ name: '', description: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('개념 생성 중 오류 발생:', err);
      alert('개념 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새 링크 생성 제출 핸들러
  const handleNewLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLinkForm.relation) {
      alert('관계 유형을 선택하세요.');
      return;
    }
    
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
      
      // 성공 메시지
      alert('새 연결이 추가되었습니다.');
      
      // 폼 초기화 및 모달 닫기
      setNewLinkForm({ source: '', target: '', relation: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('연결 생성 중 오류 발생:', err);
      alert('연결 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    setRetryCount(0); // 재시도 카운트 초기화하여 데이터 다시 로드
  };

  return (
    
    <div className="min-h-screen bg-background">
          <h1>✅ 렌더링 OK - 상태 확인</h1>
          <p>로딩 중: {String(isLoading)}</p>
          <p>노드 수: {graphData.nodes.length}</p>
          <p>링크 수: {graphData.links.length}</p>
      <Header />
      <main className="container mx-auto px-4 py-8">
      <div className="mb-4 text-sm text-gray-600 space-y-1">
        <p>✅ 디버깅 - isLoading: {String(isLoading)}</p>
        <p>✅ 디버깅 - 노드 수: {graphData.nodes?.length}</p>
        <p>✅ 디버깅 - 링크 수: {graphData.links?.length}</p>
      </div>
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
            <p className="text-sm text-red-700 mb-4">{error.message}</p>
            <Button 
              variant="outline"
              onClick={handleRefresh}
            >
              다시 시도
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 그래프 영역 */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-[600px]">
                <Loader size="lg" />
              </div>
            ) : graphData.nodes.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-[600px] p-4 text-center">
                <p className="text-lg text-gray-500 mb-4">개념 데이터가 없습니다.</p>
                <Button onClick={() => {
                  setModalType('addNode');
                  setIsModalOpen(true);
                }}>
                  첫 개념 추가하기
                </Button>
              </div>
            ) : graphData.links.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-[600px] p-4 text-center">
                <p className="text-lg text-gray-500 mb-4">개념은 있지만 연결된 링크가 없습니다.</p>
                <Button onClick={() => {
                  setModalType('addLink');
                  setIsModalOpen(true);
                }}>
                  첫 연결 추가하기
                </Button>
              </div>
            ) : (
              <ErrorBoundary 
                fallback={
                  <div className="text-red-500">
                    그래프 시각화 중 오류가 발생했습니다.
                  </div>
                }
              >
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
                      .filter((link: any) => {
                        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                        return sourceId === selectedNode.id || targetId === selectedNode.id;
                      })
                      .map((link: any) => {
                        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                        
                        const isSource = sourceId === selectedNode.id;
                        const connectedNodeId = isSource ? targetId : sourceId;
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
                    
                    {!graphData.links.some((link: any) => {
                      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                      return sourceId === selectedNode.id || targetId === selectedNode.id;
                    }) && (
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
                onChange={(e) => setNewLinkForm({ ...newLinkForm, source: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">출발 개념 선택</option>
                {graphData.nodes.map((node: any) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="target-concept" className="block text-sm font-medium text-gray-700 mb-1">
                도착 개념
              </label>
              <select
                id="target-concept"
                value={newLinkForm.target}
                onChange={(e) => setNewLinkForm({ ...newLinkForm, target: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">도착 개념 선택</option>
                {graphData.nodes
                  .filter((node: any) => node.id.toString() !== newLinkForm.source) // 출발 개념 제외
                  .map((node: any) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="relation" className="block text-sm font-medium text-gray-700 mb-1">
                관계 설명
              </label>
              <input
                type="text"
                id="relation"
                value={newLinkForm.relation}
                onChange={(e) => setNewLinkForm({ ...newLinkForm, relation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="예: 관련 있음, 확장 개념 등"
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
              disabled={!newLinkForm.source || !newLinkForm.target || !newLinkForm.relation}
            >
              추가
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isModalOpen && modalType === 'nodeDetail'}
        onClose={() => setIsModalOpen(false)}
        title="개념 상세 정보"
        size="lg"
      >
        {selectedNode && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{selectedNode.name}</h3>
              <p className="text-gray-700">{selectedNode.concept?.description || '설명 없음'}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">관련 개념</h4>
              <ul className="space-y-2">
                {graphData.links
                  .filter((link: any) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    return sourceId === selectedNode.id || targetId === selectedNode.id;
                  })
                  .map((link: any) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    
                    const isSource = sourceId === selectedNode.id;
                    const connectedNodeId = isSource ? targetId : sourceId;
                    const connectedNode = graphData.nodes.find((n: any) => n.id === connectedNodeId);
                    
                    return connectedNode ? (
                      <li key={link.id} className="p-2 border rounded-md">
                        <span className="font-medium">{connectedNode.name}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {isSource ? `→ ${link.relation || '연결됨'}` : `← ${link.relation || '연결됨'}`}
                        </span>
                      </li>
                    ) : null;
                  })
                }
                
                {!graphData.links.some((link: any) => {
                  const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                  const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                  return sourceId === selectedNode.id || targetId === selectedNode.id;
                }) && (
                  <li className="text-gray-500">관련 개념이 없습니다.</li>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
              >
                닫기
              </Button>
              <Button 
                variant="primary" 
                onClick={() => router.push(`/concept/${selectedNode.id}`)}
              >
                개념 페이지로 이동
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GraphManagement;