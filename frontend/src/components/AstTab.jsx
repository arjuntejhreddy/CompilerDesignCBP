import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, Code, Layers } from 'lucide-react';

// Recursive Visual AST Node Component
function TreeNode({ node, isRoot = false }) {
  const [expanded, setExpanded] = useState(true);

  if (!node) return null;

  const getNodeColor = (type) => {
    switch (type) {
      case 'Program': return '#a855f7';
      case 'VarDeclaration': return '#38bdf8';
      case 'Assignment': return '#06b6d4';
      case 'IfStatement': return '#f59e0b';
      case 'WhileStatement': return '#f97316';
      case 'BinaryExpr': return '#ec4899';
      case 'UnaryExpr': return '#d946ef';
      case 'Identifier': return '#10b981';
      case 'IntegerLiteral':
      case 'FloatLiteral': return '#eab308';
      default: return '#94a3b8';
    }
  };

  const hasChildren =
    (node.body && node.body.length > 0) ||
    (node.statements && node.statements.length > 0) ||
    node.left || node.right || node.condition || node.thenBranch || node.elseBranch || node.operand || node.init;

  const color = getNodeColor(node.nodeType);

  const renderChild = (label, child) => {
    if (!child) return null;
    return (
      <div style={{ marginLeft: '20px', marginTop: '6px', borderLeft: '1px dashed #334155', paddingLeft: '10px' }}>
        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginRight: '6px' }}>
          {label}:
        </span>
        <TreeNode node={child} />
      </div>
    );
  };

  return (
    <div style={{ margin: '4px 0' }}>
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-card)',
          border: `1px solid ${color}40`,
          cursor: hasChildren ? 'pointer' : 'default',
          userSelect: 'none'
        }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={14} color={color} /> : <ChevronRight size={14} color={color} />
        ) : (
          <div style={{ width: '14px' }} />
        )}

        <span style={{ fontSize: '12px', fontWeight: '700', color: color }}>
          {node.nodeType}
        </span>

        {node.name && (
          <span className="code-font" style={{ fontSize: '12px', color: '#f8fafc', fontWeight: '600' }}>
            "{node.name}"
          </span>
        )}

        {node.dataType && (
          <span style={{ fontSize: '11px', color: '#38bdf8' }}>
            ({node.dataType})
          </span>
        )}

        {node.value !== undefined && (
          <span className="code-font" style={{ fontSize: '12px', color: '#fde047' }}>
            = {String(node.value)}
          </span>
        )}

        {node.op && (
          <span className="code-font" style={{ fontSize: '12px', color: '#f43f5e', fontWeight: 'bold' }}>
            [{node.op}]
          </span>
        )}

        {node.line && (
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
            (L{node.line})
          </span>
        )}
      </div>

      {hasChildren && expanded && (
        <div style={{ marginLeft: '12px' }}>
          {/* Program Body */}
          {node.body && Array.isArray(node.body) && node.body.map((stmt, idx) => (
            <div key={idx} style={{ marginLeft: '18px', marginTop: '6px', borderLeft: '1px dashed #334155', paddingLeft: '10px' }}>
              <TreeNode node={stmt} />
            </div>
          ))}

          {/* Block Statements */}
          {node.statements && Array.isArray(node.statements) && node.statements.map((stmt, idx) => (
            <div key={idx} style={{ marginLeft: '18px', marginTop: '6px', borderLeft: '1px dashed #334155', paddingLeft: '10px' }}>
              <TreeNode node={stmt} />
            </div>
          ))}

          {/* Expressions and control flow */}
          {renderChild('Init', node.init)}
          {renderChild('Expr', node.expr)}
          {renderChild('Left', node.left)}
          {renderChild('Right', node.right)}
          {renderChild('Operand', node.operand)}
          {renderChild('Condition', node.condition)}
          {renderChild('Then', node.thenBranch)}
          {renderChild('Else', node.elseBranch)}
          {renderChild('While Body', node.nodeType === 'WhileStatement' ? node.body : null)}
        </div>
      )}
    </div>
  );
}

export default function AstTab({ ast }) {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'json'
  const [copied, setCopied] = useState(false);

  const jsonStr = JSON.stringify(ast, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ast) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)' }}>
        No Abstract Syntax Tree generated. Click Compile to parse the source code.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Top Toggle Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('tree')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: viewMode === 'tree' ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: viewMode === 'tree' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Layers size={14} />
            Interactive Tree View
          </button>

          <button
            onClick={() => setViewMode('json')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: viewMode === 'json' ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: viewMode === 'json' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Code size={14} />
            Raw JSON Inspector
          </button>
        </div>

        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            fontSize: '12px'
          }}
        >
          {copied ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
          {copied ? 'Copied JSON!' : 'Copy JSON'}
        </button>
      </div>

      {/* Main View Area */}
      {viewMode === 'tree' ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#090d16',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          overflowX: 'auto'
        }}>
          <TreeNode node={ast} isRoot={true} />
        </div>
      ) : (
        <pre className="code-font" style={{
          padding: '20px',
          backgroundColor: '#070a10',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          color: '#38bdf8',
          fontSize: '12px',
          lineHeight: '1.5',
          overflowX: 'auto'
        }}>
          {jsonStr}
        </pre>
      )}
    </div>
  );
}
