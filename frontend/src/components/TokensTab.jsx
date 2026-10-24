import React, { useState } from 'react';
import { Tag, Filter, AlertOctagon, Hash } from 'lucide-react';

export default function TokensTab({ tokens = [], tokenStats = {}, errors = [] }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const tokenTypes = ['ALL', ...Array.from(new Set(tokens.map((t) => t.type)))];

  const filteredTokens = tokens.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (searchTerm && !t.lexeme.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const lexErrors = errors.filter((e) => e.type === 'LEXICAL_ERROR');

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'KEYWORD':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case 'IDENTIFIER':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
      case 'INT_LITERAL':
      case 'FLOAT_LITERAL':
      case 'CHAR_LITERAL':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'OPERATOR':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'DELIMITER':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Lexical Error Alert if any */}
      {lexErrors.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '8px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: '600' }}>
            <AlertOctagon size={16} />
            <span>Lexical Errors Encountered ({lexErrors.length})</span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {lexErrors.map((err, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#fda4af' }}>
                • Line {err.line}, Col {err.col}: {err.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Token Distribution Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Tokens</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>
            {tokens.length}
          </div>
        </div>

        {Object.entries(tokenStats).map(([type, count]) => {
          const badge = getBadgeStyle(type);
          return (
            <div key={type} style={{
              padding: '12px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: `1px solid ${badge.border}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: badge.text, textTransform: 'uppercase', fontWeight: '600' }}>
                {type}
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--text-dim)" />
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Filter by Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            {tokenTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search lexeme..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            outline: 'none',
            width: '180px'
          }}
        />
      </div>

      {/* Tokens Table */}
      <div style={{
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-card)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: '600', width: '50px' }}>#</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: '600', width: '90px' }}>Position</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: '600', width: '140px' }}>Token Type</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Lexeme</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: '600' }}>Parsed Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No tokens match the selected filter.
                </td>
              </tr>
            ) : (
              filteredTokens.map((tok, idx) => {
                const badge = getBadgeStyle(tok.type);
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <td style={{ padding: '8px 14px', color: 'var(--text-dim)' }}>{idx + 1}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--text-muted)' }}>
                      L{tok.line}:C{tok.col}
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}>
                        {tok.type}
                      </span>
                    </td>
                    <td className="code-font" style={{ padding: '8px 14px', color: '#f8fafc', fontWeight: '500' }}>
                      {tok.lexeme}
                    </td>
                    <td className="code-font" style={{ padding: '8px 14px', color: 'var(--text-muted)' }}>
                      {tok.value !== undefined ? String(tok.value) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
