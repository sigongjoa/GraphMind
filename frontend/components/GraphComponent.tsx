import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface Node {
  id: string;
}
interface Link {
  source: string;
  target: string;
}

interface GraphProps {
  onNodeClick?: (node: Node) => void;
}

const GraphComponent: React.FC<GraphProps> = ({ onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 샘플 데이터 (추후 API 연동 예정)
  const data = {
    nodes: [
      { id: '소프트웨어 공학' },
      { id: '요구사항 분석' },
      { id: '유지보수' },
    ],
    links: [
      { source: '소프트웨어 공학', target: '요구사항 분석' },
      { source: '소프트웨어 공학', target: '유지보수' },
    ],
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* 부모 컨테이너 크기가 측정되면 ForceGraph2D에 전달 */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeAutoColorBy="id"
          nodeLabel="id"
          enableNodeDrag={false}
          enableZoomPanInteraction={false}
          onNodeClick={(node) => {
            if (onNodeClick) onNodeClick(node as Node);
          }}
        />
      )}
    </div>
  );
};

export default GraphComponent;
