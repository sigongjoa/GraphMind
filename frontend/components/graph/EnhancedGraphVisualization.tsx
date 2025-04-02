import React, { useRef, useState, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useRouter } from 'next/router';

interface GraphNode {
  id: number | string;
  name: string;
  val?: number;
  color?: string;
  x?: number;
  y?: number;
  concept?: any;
}

interface GraphLink {
  id?: string;
  source: number | string;
  target: number | string;
  label?: string;
  value?: number;
  relation?: string;
}

interface EnhancedGraphVisualizationProps {
  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  onNodeClick?: (node: GraphNode) => void;
  onNodeAdd?: (x: number, y: number) => void;
  onLinkAdd?: (source: GraphNode, target: GraphNode) => void;
  onNodeDragEnd?: (node: GraphNode, x: number, y: number) => void;
  editable?: boolean;
  layoutType?: 'force' | 'radial' | 'hierarchical';
  filter?: string;
  searchTerm?: string;
}

const EnhancedGraphVisualization: React.FC<EnhancedGraphVisualizationProps> = ({
  graphData,
  onNodeClick = () => {},
  onNodeAdd = () => {},
  onLinkAdd = () => {},
  onNodeDragEnd = () => {},
  editable = false,
  layoutType = 'force',
  filter = 'all',
  searchTerm = ''
}) => {
  const graphRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string | number>>(new Set());
  const [highlightedLinks, setHighlightedLinks] = useState<Set<string>>(new Set());
  const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number} | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [linkSource, setLinkSource] = useState<GraphNode | null>(null);
  const [filteredData, setFilteredData] = useState(graphData);
  const router = useRouter();

  // 필터링 및 검색어에 따른 그래프 데이터 필터링
  useEffect(() => {
    let nodes = [...graphData.nodes];
    let links = [...graphData.links];

    // 검색어로 필터링
    if (searchTerm) {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      nodes = nodes.filter(node => 
        node.name.toLowerCase().includes(normalizedSearchTerm) ||
        (node.concept?.description || '').toLowerCase().includes(normalizedSearchTerm)
      );

      // 필터링된 노드와 연결된 링크만 유지
      const nodeIds = new Set(nodes.map(node => node.id));
      links = links.filter(link => 
        nodeIds.has(typeof link.source === 'object' ? link.source.id : link.source) && 
        nodeIds.has(typeof link.target === 'object' ? link.target.id : link.target)
      );
    }

    // 필터 타입에 따른 필터링
    if (filter && filter !== 'all') {
      if (filter === 'recent') {
        // 최근 학습 노드만 표시 (예: 특정 플래그가 있는 노드)
        nodes = nodes.filter(node => node.concept?.recentlyLearned);
      } else if (filter === 'related' && selectedNode) {
        // 선택된 노드와 연결된 노드만 표시
        const connectedNodeIds = new Set<string | number>();
        connectedNodeIds.add(selectedNode.id);
        
        links.forEach(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          if (sourceId === selectedNode.id) {
            connectedNodeIds.add(targetId);
          }
          if (targetId === selectedNode.id) {
            connectedNodeIds.add(sourceId);
          }
        });
        
        nodes = nodes.filter(node => connectedNodeIds.has(node.id));
        links = links.filter(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId);
        });
      }
    }

    setFilteredData({ nodes, links });
  }, [graphData, filter, searchTerm, selectedNode]);

  // 레이아웃 타입에 따른 설정
  useEffect(() => {
    if (!graphRef.current) return;
    
    if (layoutType === 'force') {
      graphRef.current.d3Force('charge').strength(-120);
    } else if (layoutType === 'radial') {
      // 방사형 레이아웃 설정
      graphRef.current.d3Force('charge').strength(-300);
      graphRef.current.d3Force('radial', d3.forceRadial(300));
    } else if (layoutType === 'hierarchical') {
      // 계층적 레이아웃 설정
      graphRef.current.d3Force('link').distance(100);
      graphRef.current.d3Force('charge').strength(-200);
    }
    
    // 레이아웃 변경 시 그래프 재계산
    graphRef.current.d3ReheatSimulation();
  }, [layoutType]);

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    
    // 링크 생성 모드인 경우
    if (isCreatingLink && linkSource) {
      if (linkSource.id !== node.id) {
        onLinkAdd(linkSource, node);
        setIsCreatingLink(false);
        setLinkSource(null);
      }
    } else {
      onNodeClick(node);
    }
    
    // 선택된 노드와 연결된 노드/링크 하이라이팅
    const connectedNodeIds = new Set<string | number>();
    const connectedLinkIds = new Set<string>();
    
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const linkId = `${sourceId}-${targetId}`;
      
      if (sourceId === node.id) {
        connectedNodeIds.add(targetId);
        connectedLinkIds.add(linkId);
      }
      if (targetId === node.id) {
        connectedNodeIds.add(sourceId);
        connectedLinkIds.add(linkId);
      }
    });
    
    setHighlightedNodes(connectedNodeIds);
    setHighlightedLinks(connectedLinkIds);
  }, [graphData.links, isCreatingLink, linkSource, onLinkAdd, onNodeClick]);

  // 노드 드래그 종료 핸들러
  const handleNodeDragEnd = useCallback((node: GraphNode) => {
    if (node.x !== undefined && node.y !== undefined) {
      onNodeDragEnd(node, node.x, node.y);
    }
  }, [onNodeDragEnd]);

  // 캔버스 우클릭 핸들러 (컨텍스트 메뉴)
  const handleContextMenu = useCallback((event: MouseEvent) => {
    if (!editable) return;
    
    event.preventDefault();
    
    const pos = graphRef.current.screen2GraphCoords(event.offsetX, event.offsetY);
    setContextMenuPos({ x: event.clientX, y: event.clientY });
  }, [editable]);

  // 새 노드 추가 핸들러
  const handleAddNode = useCallback(() => {
    if (contextMenuPos && graphRef.current) {
      const pos = graphRef.current.screen2GraphCoords(contextMenuPos.x, contextMenuPos.y);
      onNodeAdd(pos.x, pos.y);
    }
    setContextMenuPos(null);
  }, [contextMenuPos, onNodeAdd]);

  // 링크 생성 시작 핸들러
  const handleStartLinkCreation = useCallback(() => {
    if (selectedNode) {
      setIsCreatingLink(true);
      setLinkSource(selectedNode);
      setContextMenuPos(null);
    }
  }, [selectedNode]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // ESC 키로 링크 생성 취소
        setIsCreatingLink(false);
        setLinkSource(null);
        setContextMenuPos(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 캔버스 클릭 핸들러 (컨텍스트 메뉴 닫기)
  const handleCanvasClick = useCallback(() => {
    setContextMenuPos(null);
  }, []);

  // 노드 색상 및 크기 계산
  const getNodeColor = (node: GraphNode) => {
    if (!selectedNode) return node.color || '#1f77b4';
    
    if (node.id === selectedNode.id) {
      return '#ff6347'; // 선택된 노드는 빨간색
    }
    
    if (highlightedNodes.has(node.id)) {
      return '#ffa500'; // 연결된 노드는 주황색
    }
    
    return '#a0a0a0'; // 기타 노드는 회색
  };
  
  const getNodeSize = (node: GraphNode) => {
    if (!selectedNode) return node.val || 5;
    
    if (node.id === selectedNode.id) {
      return 10; // 선택된 노드는 크게
    }
    
    if (highlightedNodes.has(node.id)) {
      return 7; // 연결된 노드는 중간 크기
    }
    
    return 4; // 기타 노드는 작게
  };

  // 링크 색상 계산
  const getLinkColor = (link: GraphLink) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const linkId = `${sourceId}-${targetId}`;
    
    if (highlightedLinks.has(linkId)) {
      return '#ffa500'; // 하이라이트된 링크는 주황색
    }
    
    return '#cccccc'; // 기타 링크는 회색
  };

  return (
    <div className="relative w-full h-full">
      {/* 그래프 시각화 */}
      <ForceGraph2D
        ref={graphRef}
        graphData={filteredData}
        nodeLabel={(node: GraphNode) => `${node.name}`}
        nodeColor={getNodeColor}
        nodeVal={getNodeSize}
        linkLabel={(link: GraphLink) => link.label || link.relation || ''}
        linkWidth={(link) => 1.5}
        linkColor={getLinkColor}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={handleNodeClick}
        onNodeDragEnd={handleNodeDragEnd}
        onBackgroundClick={handleCanvasClick}
        onBackgroundRightClick={handleContextMenu}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // 노드 렌더링 커스터마이징
          const label = node.name;
          const fontSize = 12 / globalScale;
          const nodeColor = getNodeColor(node as GraphNode);
          const nodeSize = getNodeSize(node as GraphNode);
          
          // 노드 원 그리기
          ctx.beginPath();
          ctx.fillStyle = nodeColor;
          ctx.arc(node.x || 0, node.y || 0, nodeSize, 0, 2 * Math.PI);
          ctx.fill();
          
          // 링크 생성 모드인 경우 소스 노드 표시
          if (isCreatingLink && linkSource && node.id === linkSource.id) {
            ctx.beginPath();
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2 / globalScale;
            ctx.arc(node.x || 0, node.y || 0, nodeSize + 2, 0, 2 * Math.PI);
            ctx.stroke();
          }
          
          // 노드 라벨 그리기
          if (globalScale > 0.7 || node.id === selectedNode?.id || highlightedNodes.has(node.id)) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 라벨 배경
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(
              (node.x || 0) - bckgDimensions[0] / 2,
              (node.y || 0) + nodeSize + 2,
              bckgDimensions[0],
              bckgDimensions[1]
            );
            
            // 라벨 텍스트
            ctx.fillStyle = '#333333';
            ctx.fillText(label, node.x || 0, (node.y || 0) + nodeSize + 2 + fontSize / 2);
          }
        }}
        cooldownTicks={100}
        onEngineStop={() => {
          // 그래프 렌더링 완료 시 실행할 코드
        }}
      />
      
      {/* 링크 생성 모드 표시 */}
      {isCreatingLink && (
        <div className="absolute top-4 left-4 bg-yellow-100 p-2 rounded shadow text-sm">
          <p>링크 생성 모드: 대상 노드를 선택하세요. (취소: ESC)</p>
        </div>
      )}
      
      {/* 컨텍스트 메뉴 */}
      {contextMenuPos && (
        <div
          className="absolute bg-white rounded shadow-md z-10 overflow-hidden"
          style={{
            left: `${contextMenuPos.x}px`,
            top: `${contextMenuPos.y}px`,
          }}
        >
          <ul className="divide-y divide-gray-100">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleAddNode}
            >
              새 개념 추가
            </li>
            {selectedNode && (
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleStartLinkCreation}
              >
                링크 생성
              </li>
            )}
            {selectedNode && (
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/concept/${selectedNode.id}`)}
              >
                개념 상세보기
              </li>
            )}
            {selectedNode && (
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/learning/${selectedNode.id}`)}
              >
                학습하기
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnhancedGraphVisualization;