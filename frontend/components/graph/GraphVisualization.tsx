import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface GraphVisualizationProps {
  graphData: {
    nodes: any[];
    links: any[];
  };
  onNodeClick: (node: any) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ 
  graphData, 
  onNodeClick 
}) => {
  const graphRef = useRef<any>(null);

  useEffect(() => {
    // 그래프가 로드되면 줌 레벨 조정
    if (graphRef.current) {
      graphRef.current.zoom(1.5);
      graphRef.current.d3Force('charge').strength(-120);
    }
  }, []);

  const handleNodeClick = (node: any) => {
    if (graphRef.current) {
      // 노드를 중앙으로 이동
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
    onNodeClick(node);
  };

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      nodeLabel="name"
      nodeColor="color"
      nodeVal="val"
      linkLabel="label"
      linkWidth="value"
      linkDirectionalArrowLength={3}
      linkDirectionalArrowRelPos={1}
      onNodeClick={handleNodeClick}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

        // 노드 배경
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // 텍스트 배경
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y + 6,
          bckgDimensions[0],
          bckgDimensions[1]
        );

        // 텍스트
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.fillText(label, node.x, node.y + 6 + fontSize / 2);
      }}
      cooldownTicks={100}
      onEngineStop={() => {
        // 그래프 렌더링이 완료되면 실행할 코드
      }}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={1}
      linkDirectionalParticleSpeed={0.005}
    />
  );
};

export default GraphVisualization;
