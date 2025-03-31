// 개념 그래프 컴포넌트: GraphVisualization.tsx
import React, { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

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

interface GraphVisualizationProps {
  nodes: ConceptNode[];
  edges: ConnectionEdge[];
  onNodeClick: (node: ConceptNode) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  nodes,
  edges,
  onNodeClick
}) => {
  const graphRef = useRef<any>(null);

  // 그래프 데이터 형식 변환
  const graphData = {
    nodes: nodes.map(node => ({ 
      id: node.id, 
      name: node.name, 
      description: node.description,
      val: 1 // 노드 크기
    })),
    links: edges.map(edge => ({ 
      id: edge.id,
      source: edge.source, 
      target: edge.target, 
      relation: edge.relation,
      value: edge.strength // 연결 강도
    }))
  };

  useEffect(() => {
    // 그래프가 렌더링된 후 줌 레벨 조정
    if (graphRef.current) {
      graphRef.current.zoom(1.5);
      graphRef.current.d3Force('charge').strength(-300);
    }
  }, []);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      nodeLabel="name"
      nodeColor={() => '#4A6FA5'} // primary 색상
      nodeRelSize={6}
      linkColor={() => '#6B8F71'} // secondary 색상
      linkWidth={link => (link.value as number) * 2}
      linkDirectionalArrowLength={3}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.25}
      onNodeClick={(node: any) => {
        const originalNode = nodes.find(n => n.id === node.id);
        if (originalNode) {
          onNodeClick(originalNode);
        }
      }}
      onNodeHover={(node: any) => {
        if (node) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
      }}
      cooldownTicks={100}
      onEngineStop={() => graphRef.current?.zoomToFit(400)}
    />
  );
};

export default GraphVisualization;
