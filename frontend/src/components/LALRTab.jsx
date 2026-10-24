import React, { useState, useEffect } from 'react';
import { compilerApi } from '../api/compilerApi';
import { Play, Layers, GitCommit, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function LALRTab() {
  const [expression, setExpression] = useState('id + id * num');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(0);

  const fetchLALR = async (exprToRun) => {
    setLoading(true);
    setError(null);
    try {
      const res = await compilerApi.runLALR(exprToRun);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLALR('id + id * num');
  }, []);

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Banner */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-purple)', marginBottom: '4px' }}>
          LALR(1) Parser Demonstration (Bison / YACC Architecture)
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Demonstrates Bison/YACC canonical collection of LR item sets, Action and Goto tables, and interactive shift-reduce parsing simulation.
        </p>
      </div>

      {/* Test Expression Input Bar */}
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
          Input Expression:
        </span>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. id + id * num or ( id + num ) * id"
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
          onClick={() => fetchLALR(expression)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--accent-purple)',
            color: '#ffffff',
            border: 'none',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <Play size={14} fill="#ffffff" />
          {loading ? 'Running...' : 'Run LALR Parser'}
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
          {/* Section 1: Grammar Rules & States */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Grammar Rules Box */}
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              padding: '16px'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '10px' }}>
                Bison Grammar Productions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.grammarRules.map((r) => (
                  <div key={r.id} className="code-font" style={{ fontSize: '12px', color: '#94a3b8' }}>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: '600', marginRight: '8px' }}>
                      ({r.id})
                    </span>
                    <span style={{ color: '#ffffff', fontWeight: '600' }}>{r.lhs}</span>
                    <span style={{ color: '#64748b', margin: '0 6px' }}>-&gt;</span>
                    <span style={{ color: '#38bdf8' }}>{r.rhs.join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Canonical State Items Explorer */}
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                  Canonical LR Item Sets
                </h4>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(parseInt(e.target.value, 10))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '11px',
                    outline: 'none'
                  }}
                >
                  {data.statesSummary.map((s) => (
                    <option key={s.state} value={s.state}>State I_{s.state}</option>
                  ))}
                </select>
              </div>

              {data.statesSummary[selectedState] && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: '600', marginBottom: '6px' }}>
                    Items in State {selectedState}:
                  </div>
                  <div className="code-font" style={{
                    padding: '10px',
                    backgroundColor: '#070a10',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    color: '#e2e8f0',
                    lineHeight: '1.6'
                  }}>
                    {data.statesSummary[selectedState].items.map((item, i) => (
                      <div key={i} style={{ color: item.includes('• E') ? '#a855f7' : '#94a3b8' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Action & Goto Parsing Table */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#f8fafc' }}>
              2. LALR(1) Parsing Table (ACTION & GOTO)
            </h4>
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflowX: 'auto',
              backgroundColor: 'var(--bg-card)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '8px 12px', borderRight: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>State</th>
                    <th colSpan={data.terminals.length} style={{ padding: '8px 12px', color: 'var(--accent-cyan)', borderRight: '1px solid var(--border-color)' }}>
                      ACTION Table
                    </th>
                    <th colSpan={data.nonTerminals.length} style={{ padding: '8px 12px', color: 'var(--accent-purple)' }}>
                      GOTO Table
                    </th>
                  </tr>
                  <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '6px 12px', borderRight: '1px solid var(--border-color)', color: 'var(--text-dim)' }}>#</th>
                    {data.terminals.map((t) => (
                      <th key={t} className="code-font" style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>{t}</th>
                    ))}
                    {data.nonTerminals.map((nt) => (
                      <th key={nt} className="code-font" style={{ padding: '6px 10px', color: 'var(--text-muted)', borderLeft: nt === data.nonTerminals[0] ? '1px solid var(--border-color)' : 'none' }}>
                        {nt}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(data.actionTable).map((stateStr) => {
                    const st = parseInt(stateStr, 10);
                    return (
                      <tr key={st} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td className="code-font" style={{ padding: '6px 12px', fontWeight: '700', color: '#ffffff', borderRight: '1px solid var(--border-color)' }}>
                          {st}
                        </td>
                        {data.terminals.map((t) => {
                          const act = data.actionTable[st]?.[t] || '';
                          const isShift = act.startsWith('s');
                          const isReduce = act.startsWith('r');
                          const isAcc = act === 'acc';
                          return (
                            <td key={t} className="code-font" style={{
                              padding: '6px 10px',
                              color: isShift ? '#38bdf8' : isReduce ? '#fbbf24' : isAcc ? '#34d399' : '#475569',
                              fontWeight: act ? '600' : 'normal',
                              backgroundColor: isAcc ? 'rgba(52, 211, 153, 0.1)' : 'transparent'
                            }}>
                              {act || '-'}
                            </td>
                          );
                        })}
                        {data.nonTerminals.map((nt, idx) => {
                          const gt = data.gotoTable[st]?.[nt];
                          return (
                            <td key={nt} className="code-font" style={{
                              padding: '6px 10px',
                              color: gt !== undefined ? '#c084fc' : '#475569',
                              fontWeight: gt !== undefined ? '600' : 'normal',
                              borderLeft: idx === 0 ? '1px solid var(--border-color)' : 'none'
                            }}>
                              {gt !== undefined ? gt : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Shift-Reduce Trace */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#f8fafc' }}>
              3. Step-by-Step Shift-Reduce Simulation Trace
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
                    <th style={{ padding: '10px 14px', width: '160px', color: 'var(--accent-purple)' }}>State Stack</th>
                    <th style={{ padding: '10px 14px', width: '160px', color: 'var(--accent-blue)' }}>Symbol Stack</th>
                    <th style={{ padding: '10px 14px', width: '180px', color: 'var(--accent-amber)' }}>Remaining Input</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-main)' }}>Action / Reduction Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trace.map((tr, idx) => {
                    const isAccept = tr.action.includes('ACCEPT');
                    const isError = tr.action.includes('ERROR');
                    const isShift = tr.action.startsWith('Shift');
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
                        <td className="code-font" style={{ padding: '8px 14px', color: '#c084fc' }}>
                          {tr.stateStack}
                        </td>
                        <td className="code-font" style={{ padding: '8px 14px', color: '#38bdf8' }}>
                          {tr.symbolStack}
                        </td>
                        <td className="code-font" style={{ padding: '8px 14px', color: '#fbbf24' }}>
                          {tr.remainingInput}
                        </td>
                        <td style={{
                          padding: '8px 14px',
                          color: isAccept ? 'var(--accent-green)' : isError ? 'var(--accent-rose)' : isShift ? '#38bdf8' : '#fde047',
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
