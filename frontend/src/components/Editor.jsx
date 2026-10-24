import React, { useRef, useState } from 'react';
import { Code, FileText, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function Editor({ code, onChange, errors = [] }) {
  const textareaRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const lineCount = (code.match(/\n/g) || []).length + 1;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const errorLines = new Set(errors.map((e) => e.line));

  const handleCursorMove = (e) => {
    const text = e.target.value.substring(0, e.target.selectionStart);
    const line = (text.match(/\n/g) || []).length + 1;
    const col = text.length - text.lastIndexOf('\n');
    setCursorPos({ line, col });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      {/* Editor Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={16} color="var(--accent-blue)" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
            Source Code (Restricted C Subset)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {errors.length > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--accent-rose)',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              <AlertTriangle size={13} />
              <span>{errors.length} error{errors.length > 1 ? 's' : ''} detected</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--accent-green)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              <CheckCircle2 size={13} />
              <span>Syntax Valid</span>
            </div>
          )}
        </div>
      </div>

      {/* Editor Body: Line Numbers + Textarea */}
      <div style={{
        display: 'flex',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0a0e17'
      }}>
        {/* Line Numbers Column */}
        <div style={{
          width: '48px',
          padding: '16px 8px 16px 0',
          backgroundColor: '#070a10',
          borderRight: '1px solid var(--border-subtle)',
          textAlign: 'right',
          userSelect: 'none',
          color: '#475569',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          {lines.map((num) => {
            const hasError = errorLines.has(num);
            return (
              <div
                key={num}
                style={{
                  color: hasError ? 'var(--accent-rose)' : '#475569',
                  fontWeight: hasError ? 'bold' : 'normal',
                  backgroundColor: hasError ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
                  borderRadius: '2px',
                  paddingRight: '4px'
                }}
              >
                {num}
              </div>
            );
          })}
        </div>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          spellCheck="false"
          placeholder="// Type or paste C code here...&#10;int a = 10;&#10;while (a > 0) {&#10;    a = a - 1;&#10;}"
          style={{
            flex: 1,
            height: '100%',
            padding: '16px',
            backgroundColor: 'transparent',
            color: '#f8fafc',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: '1.6',
            whiteSpace: 'pre',
            overflowY: 'auto'
          }}
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        fontSize: '11px',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{code.length} characters</span>
          <span>{lineCount} lines</span>
        </div>
        <div>
          <span>Grammar: C Subset (Decl, Assign, If-Else, While, Expr)</span>
        </div>
      </div>
    </div>
  );
}
