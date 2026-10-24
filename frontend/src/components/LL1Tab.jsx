import React, { useState, useEffect } from 'react';
import { compilerApi } from '../api/compilerApi';
import { Play, CheckCircle2, AlertTriangle, ArrowRight, Table } from 'lucide-react';

export default function LL1Tab() {
  const [expression, setExpression] = useState('id + num * id');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLL1 = async (exprToRun) => {
    setLoading(true);
    setError(null);
    try {
      const res = await compilerApi.runLL1(exprToRun);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLL1('id + num * id');
  }, []);

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Overview Title Banner */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '4px' }}>
          LL(1) Predictive Parser Demonstration
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Demonstrates computation of FIRST and FOLLOW sets, construction of the LL(1) M-Table, and step-by-step predictive parsing simulation for Compiler Design course lab.
        </p>
      </div>

      {/* Interactive Simulation Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        padding: '14px',
        backgroundColor: '#090d16',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
          Test Expression:
        </span>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. id + num * id or ( id + id ) * num"
          className="code-font"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-card)',
            color: '#f8fafc',
            border: '1px solid var(--border-color)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button
          onClick={() => fetchLL1(expression)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--accent-blue)',
            color: '#ffffff',
            border: 'none',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <Play size={14} fill="#ffffff" />
          {loading ? 'Simulating...' : 'Simulate LL(1)'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '6px',
          color: 'var(--accent-rose)',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: FIRST and FOLLOW Sets */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#f8fafc' }}>
              1. FIRST & FOLLOW Sets
            </h4>
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 16px', width: '140px', color: 'var(--text-muted)' }}>Non-Terminal</th>
                    <th style={{ padding: '10px 16px', color: 'var(--accent-blue)' }}>FIRST(A)</th>
                    <th style={{ padding: '10px 16px', color: 'var(--accent-purple)' }}>FOLLOW(A)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(data.firstSets).map((nt, idx) => (
                    <tr key={nt} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td className="code-font" style={{ padding: '10px 16px', fontWeight: '700', color: '#ffffff' }}>
                        {nt}
                      </td>
                      <td className="code-font" style={{ padding: '10px 16px', color: '#38bdf8' }}>
                        {`{ ${data.firstSets[nt].join(', ')} }`}
                      </td>
                      <td className="code-font" style={{ padding: '10px 16px', color: '#c084fc' }}>
                        {`{ ${data.followSets[nt].join(', ')} }`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: LL(1) Parsing Table (M-Table) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
                2. LL(1) Parsing Table (M-Table)
              </h4>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: data.isLL1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: data.isLL1 ? 'var(--accent-green)' : 'var(--accent-rose)',
                fontWeight: '600'
              }}>
                {data.isLL1 ? 'Valid LL(1) (No Conflicts)' : 'Conflicts Detected'}
              </span>
            </div>

            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflowX: 'auto',
              backgroundColor: 'var(--bg-card)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)' }}>Non-Terminal</th>
                    {data.grammar.terminals.filter(t => t !== 'ε').map((t) => (
                      <th key={t} className="code-font" style={{ padding: '10px 14px', color: 'var(--accent-cyan)' }}>
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(data.parseTable).map((nt) => (
                    <tr key={nt} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td className="code-font" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#ffffff' }}>
                        {nt}
                      </td>
                      {data.grammar.terminals.filter(t => t !== 'ε').map((t) => {
                        const entry = data.parseTable[nt][t];
                        const isEmpty = entry === '-';
                        return (
                          <td
                            key={t}
                            className="code-font"
                            style={{
                              padding: '10px 14px',
                              color: isEmpty ? 'var(--text-dim)' : '#fde047',
                              backgroundColor: isEmpty ? 'transparent' : 'rgba(250, 204, 21, 0.05)'
                            }}
                          >
                            {entry}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Predictive Parse Trace */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#f8fafc' }}>
              3. Step-by-Step Predictive Parser Simulation Trace
            </h4>
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px', width: '50px', color: 'var(--text-muted)' }}>Step</th>
                    <th style={{ padding: '10px 14px', width: '220px', color: 'var(--accent-blue)' }}>Parsing Stack</th>
                    <th style={{ padding: '10px 14px', width: '220px', color: 'var(--accent-amber)' }}>Remaining Input</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-main)' }}>Action / Production Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trace.map((tr, idx) => {
                    const isAccept = tr.action.includes('ACCEPT');
                    const isError = tr.action.includes('ERROR');
                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: isAccept
                            ? 'rgba(16, 185, 129, 0.08)'
                            : isError
                            ? 'rgba(244, 63, 94, 0.08)'
                            : idx % 2 === 0
                            ? 'transparent'
                            : 'rgba(255,255,255,0.01)'
                        }}
                      >
                        <td style={{ padding: '8px 14px', color: 'var(--text-dim)' }}>{tr.step}</td>
                        <td className="code-font" style={{ padding: '8px 14px', color: '#38bdf8', fontWeight: '500' }}>
                          {tr.stack}
                        </td>
                        <td className="code-font" style={{ padding: '8px 14px', color: '#fbbf24' }}>
                          {tr.input}
                        </td>
                        <td style={{
                          padding: '8px 14px',
                          color: isAccept ? 'var(--accent-green)' : isError ? 'var(--accent-rose)' : '#e2e8f0',
                          fontWeight: (isAccept || isError) ? '700' : 'normal'
                        }}>
                          {tr.action}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
