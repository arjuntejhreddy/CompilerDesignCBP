import React from 'react';
import { Database, Key, Hash } from 'lucide-react';

export default function SymbolTableTab({ symbolTable = [] }) {
  if (!symbolTable || symbolTable.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)' }}>
        No identifiers registered in the symbol table. Declare variables in your source code.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '4px' }}>
          Symbol Table Information
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Tracks variable identifiers, data types, scope, and line of declaration for semantic analysis.
        </p>
      </div>

      <div style={{
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-card)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '10px 16px', width: '60px', color: 'var(--text-muted)' }}>#</th>
              <th style={{ padding: '10px 16px', color: 'var(--accent-blue)' }}>Identifier Name</th>
              <th style={{ padding: '10px 16px', color: 'var(--accent-purple)' }}>Data Type</th>
              <th style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>Scope</th>
              <th style={{ padding: '10px 16px', color: 'var(--accent-amber)' }}>Line Defined</th>
            </tr>
          </thead>
          <tbody>
            {symbolTable.map((sym, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                }}
              >
                <td style={{ padding: '8px 16px', color: 'var(--text-dim)' }}>{idx + 1}</td>
                <td className="code-font" style={{ padding: '8px 16px', fontWeight: '700', color: '#f8fafc' }}>
                  {sym.name}
                </td>
                <td style={{ padding: '8px 16px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}>
                    {sym.type}
                  </span>
                </td>
                <td style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>
                  {sym.scope || 'global'}
                </td>
                <td style={{ padding: '8px 16px', color: '#fbbf24' }}>
                  Line {sym.line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
