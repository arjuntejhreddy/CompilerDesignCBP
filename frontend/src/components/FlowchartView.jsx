import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from '@xyflow/react';
import { Share2, Maximize2, GitMerge, FileCode, Eye } from 'lucide-react';

// Custom Node: Terminal (Start / End)
function TerminalNode({ data }) {
  return (
    <div className="flow-node flow-node-terminal">
      <Handle type="target" position={Position.Top} style={{ background: '#a855f7' }} />
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
        {data.label}
      </div>
      <div style={{ fontSize: '13px', marginTop: '2px' }}>{data.code}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#a855f7' }} />
    </div>
  );
}

// Custom Node: Process (Declarations / Assignments)
function ProcessNode({ data }) {
  return (
    <div className="flow-node flow-node-process">
      <Handle type="target" position={Position.Top} style={{ background: '#38bdf8' }} />
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>
        {data.label}
      </div>
      <div className="code-font" style={{ fontSize: '13px', fontWeight: '500', color: '#38bdf8' }}>
        {data.code}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#38bdf8' }} />
    </div>
  );
}

// Custom Node: Decision (If / While Condition Diamond)
function DecisionNode({ data }) {
  return (
    <div className="flow-node flow-node-decision">
      <Handle type="target" position={Position.Top} style={{ background: '#f59e0b' }} />
      <div style={{ fontSize: '11px', color: '#fde047', textTransform: 'uppercase', marginBottom: '2px' }}>
        {data.label}
      </div>
      <div className="code-font" style={{ fontSize: '13px', fontWeight: '600', color: '#fef08a' }}>
        {data.code}
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ background: '#10b981' }} />
      <Handle type="source" position={Position.Right} id="false" style={{ background: '#ef4444' }} />
    </div>
  );
}

// Custom Node: Connector / Merge Circle
function ConnectorNode({ data }) {
  return (
    <div className="flow-node-connector" title={data.label || 'Merge'}>
      <Handle type="target" position={Position.Top} style={{ background: '#64748b' }} />
      <GitMerge size={14} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#64748b' }} />
    </div>
  );
}

export default function FlowchartView({
  nodes = [],
  edges = [],
  mermaid = '',
  onOpenMermaid
}) {
  const nodeTypes = useMemo(
    () => ({
      terminal: TerminalNode,
      process: ProcessNode,
      decision: DecisionNode,
      connector: ConnectorNode
    }),
    []
  );

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  React.useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  if (!nodes || nodes.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        gap: '12px',
        padding: '24px'
      }}>
        <Share2 size={42} opacity={0.4} />
        <p style={{ fontSize: '15px', fontWeight: '500' }}>No Flowchart Generated Yet</p>
        <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '360px' }}>
          Enter C source code on the left and click <strong>Compile & Generate</strong> to visualize the interactive flowchart.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#090d16' }}>
      {/* Floating Toolbar */}
      <div style={{
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '6px' }}>
          <strong>{nodes.length}</strong> nodes • <strong>{edges.length}</strong> edges
        </div>

        <button
          onClick={onOpenMermaid}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--accent-blue)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          <Eye size={13} />
          Mermaid View
        </button>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#1e293b" gap={18} size={1} />
        <Controls
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.shape === 'oval') return '#a855f7';
            if (n.data?.shape === 'diamond') return '#f59e0b';
            if (n.data?.shape === 'circle') return '#64748b';
            return '#38bdf8';
          }}
          maskColor="rgba(11, 15, 23, 0.8)"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            width: 140,
            height: 100
          }}
        />
      </ReactFlow>
    </div>
  );
}
