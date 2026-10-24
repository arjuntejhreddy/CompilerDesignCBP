import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { X, Copy, Check, Download, Code2 } from 'lucide-react';

export default function MermaidModal({ isOpen, onClose, mermaidCode }) {
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    if (isOpen && mermaidCode) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          darkMode: true,
          background: '#0b0f17',
          primaryColor: '#1e293b',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#38bdf8',
          lineColor: '#64748b'
        }
      });

      const renderDiagram = async () => {
        try {
          setRenderError(null);
          const { svg } = await mermaid.render('mermaid-svg-chart', mermaidCode);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (err) {
          console.error('Mermaid render error:', err);
          setRenderError(err.message);
        }
      };

      renderDiagram();
    }
  }, [isOpen, mermaidCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '24px'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '850px',
        maxHeight: '85vh',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Mermaid.js Flowchart</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontSize: '12px'
              }}
            >
              {copied ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '4px',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Rendered SVG Diagram */}
          <div style={{
            padding: '24px',
            backgroundColor: '#070a10',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowX: 'auto'
          }}>
            {renderError ? (
              <div style={{ color: 'var(--accent-rose)', fontSize: '13px' }}>
                Failed to render diagram: {renderError}
              </div>
            ) : (
              <div ref={containerRef} style={{ width: '100%', textAlign: 'center' }} />
            )}
          </div>

          {/* Raw Mermaid Syntax */}
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Raw Mermaid Diagram Definition:
            </h4>
            <pre className="code-font" style={{
              padding: '14px',
              backgroundColor: '#070a10',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              color: '#38bdf8',
              fontSize: '12px',
              lineHeight: '1.5',
              overflowX: 'auto',
              maxHeight: '160px'
            }}>
              {mermaidCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
