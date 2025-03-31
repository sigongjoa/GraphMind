import React, { useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const GraphComponent = () => {
  const graphRef = useRef();

  const data = {
    nodes: [
      { id: '소프트웨어 공학', group: 1 },
      { id: '요구사항 분석', group: 2 },
      { id: '유지보수', group: 2 }
    ],
    links: [
      { source: '소프트웨어 공학', target: '요구사항 분석' },
      { source: '소프트웨어 공학', target: '유지보수' }
    ]
  };

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={data}
      nodeAutoColorBy="group"
      nodeLabel="id"
    />
  );
};

export default GraphComponent;
