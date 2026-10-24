import React, { useState } from 'react';
import { Copy, Check, Terminal, Table, Cpu } from 'lucide-react';

export default function IntermediateTab({ tac = { lines: [], quadruples: [] }, assembly = [] }) {
  const [subTab, setSubTab] = useState('tac'); // 'tac', 'quadruples', or 'assembly'
  const [copied, setCopied] = useState(false);

  const tacText = (tac.lines || []).join('\n');
  const asmText = assembly.map((a) => `${a.code.padEnd(28)} ${a.comment ? '; ' + a.comment : ''}`).join('\n');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Subtab Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSubTab('tac')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: subTab === 'tac' ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: subTab === 'tac' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Terminal size={14} />
            Three-Address Code (TAC)
          </button>

          <button
            onClick={() => setSubTab('quadruples')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: subTab === 'quadruples' ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: subTab === 'quadruples' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Table size={14} />
            Quadruples Table
          </button>

          <button
            onClick={() => setSubTab('assembly')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: subTab === 'assembly' ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: subTab === 'assembly' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Cpu size={14} />
            Pseudo-Machine Assembly
          </button>
        </div>

        <button
          onClick={() => handleCopy(subTab === 'assembly' ? asmText : tacText)}
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
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      {/* 1. Linear Three-Address Code View */}
      {subTab === 'tac' && (
        <div style={{
          backgroundColor: '#070a10',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          padding: '16px',
          overflowX: 'auto'
        }}>
          {(!tac.lines || tac.lines.length === 0) ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
              No Three-Address Code generated. Compile your source code first.
            </div>
          ) : (
            <pre className="code-font" style={{ fontSize: '13px', lineHeight: '1.7', color: '#f8fafc' }}>
              {tac.lines.map((line, idx) => {
                const isLabel = line.endsWith(':');
                const isJump = line.startsWith('goto') || line.startsWith('if_');
                return (
                  <div key={idx} style={{
                    color: isLabel ? 'var(--accent-purple)' : isJump ? '#fbbf24' : '#38bdf8',
                    fontWeight: isLabel ? '700' : 'normal'
                  }}>
                    <span style={{ color: '#475569', display: 'inline-block', width: '36px', userSelect: 'none' }}>
                      {idx}:
                    </span>
                    {line}
                  </div>
                );
              })}
            </pre>
          )}
        </div>
      )}

      {/* 2. Quadruples Table View */}
      {subTab === 'quadruples' && (
        <div style={{
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 16px', width: '70px', color: 'var(--text-muted)' }}>Index</th>
                <th style={{ padding: '10px 16px', width: '120px', color: 'var(--accent-cyan)' }}>Op</th>
                <th style={{ padding: '10px 16px', color: 'var(--accent-blue)' }}>Arg1</th>
                <th style={{ padding: '10px 16px', color: 'var(--accent-purple)' }}>Arg2</th>
                <th style={{ padding: '10px 16px', color: 'var(--accent-amber)' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {(!tac.quadruples || tac.quadruples.length === 0) ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No quadruples generated.
                  </td>
                </tr>
              ) : (
                tac.quadruples.map((q, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <td style={{ padding: '8px 16px', color: 'var(--text-dim)' }}>({q.index})</td>
                    <td className="code-font" style={{ padding: '8px 16px', color: '#06b6d4', fontWeight: '700' }}>
                      {q.op}
                    </td>
                    <td className="code-font" style={{ padding: '8px 16px', color: '#38bdf8' }}>
                      {q.arg1 || '-'}
                    </td>
                    <td className="code-font" style={{ padding: '8px 16px', color: '#c084fc' }}>
                      {q.arg2 || '-'}
                    </td>
                    <td className="code-font" style={{ padding: '8px 16px', color: '#fde047', fontWeight: '600' }}>
                      {q.result || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Pseudo-Machine Assembly View */}
      {subTab === 'assembly' && (
        <div style={{
          backgroundColor: '#070a10',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          padding: '16px',
          overflowX: 'auto'
        }}>
          {(!assembly || assembly.length === 0) ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
              No pseudo-machine code generated.
            </div>
          ) : (
            <pre className="code-font" style={{ fontSize: '13px', lineHeight: '1.7' }}>
              {assembly.map((item, idx) => {
                const isComment = item.code.startsWith(';') || item.code.startsWith('SECTION') || item.code.startsWith('GLOBAL');
                const isLabel = item.code.endsWith(':');
                return (
                  <div key={idx} style={{ display: 'flex', gap: '20px' }}>
                    <span style={{
                      color: isComment ? '#64748b' : isLabel ? 'var(--accent-purple)' : '#f8fafc',
                      fontWeight: isLabel ? '700' : 'normal',
                      minWidth: '220px'
                    }}>
                      {item.code}
                    </span>
                    {item.comment && (
                      <span style={{ color: '#475569', fontStyle: 'italic' }}>
                        ; {item.comment}
                      </span>
                    )}
                  </div>
                );
              })}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
