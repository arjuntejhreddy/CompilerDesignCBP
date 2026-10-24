import React, { useState, useEffect } from 'react';
import { compilerApi } from '../api/compilerApi';
import { Calculator, Play, CheckCircle2, AlertTriangle, Layers, ArrowRight } from 'lucide-react';

export default function ExprEvalTab() {
  const [expression, setExpression] = useState('12 + 4 * 3 - (12 / 4) + 10');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const evaluate = async (exprToRun) => {
    setLoading(true);
    setError(null);
    try {
      const res = await compilerApi.evaluateExpr(exprToRun);
      if (res.success) {
        setData(res);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluate('12 + 4 * 3 - (12 / 4) + 10');
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
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
          Arithmetic Expression Validator & Evaluator
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Validates operator precedence and associativity, converts between Infix, Postfix (RPN) and Prefix, and simulates step-by-step operand stack evaluation.
        </p>
      </div>

      {/* Input Bar */}
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
          Expression:
        </span>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. (10 + 5) * 4 - 8 / 2"
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
          onClick={() => evaluate(expression)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--accent-cyan)',
            color: '#090d16',
            border: 'none',
            fontSize: '12px',
            fontWeight: '700'
          }}
        >
          <Play size={14} fill="#090d16" />
          {loading ? 'Evaluating...' : 'Evaluate'}
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
          {/* Section 1: Representations & Evaluated Value */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Infix Expression</div>
              <div className="code-font" style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginTop: '6px' }}>
                {data.infix}
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: '600' }}>
                Postfix (RPN)
              </div>
              <div className="code-font" style={{ fontSize: '15px', fontWeight: '600', color: '#38bdf8', marginTop: '6px' }}>
                {data.postfix}
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: '600' }}>
                Prefix (Polish)
              </div>
              <div className="code-font" style={{ fontSize: '15px', fontWeight: '600', color: '#c084fc', marginTop: '6px' }}>
                {data.prefix}
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-green)', textTransform: 'uppercase', fontWeight: '600' }}>
                Computed Result
              </div>
              <div className="code-font" style={{ fontSize: '24px', fontWeight: '800', color: '#34d399', marginTop: '2px' }}>
                {data.result}
              </div>
            </div>
          </div>

          {/* Section 2: Step-by-Step Operand Stack Evaluation Trace */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#f8fafc' }}>
              Step-by-Step Operand Stack Trace (Reverse Polish Evaluation)
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
                    <th style={{ padding: '10px 14px', width: '100px', color: 'var(--accent-amber)' }}>Token Read</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', width: '200px' }}>Stack Before</th>
                    <th style={{ padding: '10px 14px', color: '#ffffff' }}>Operation Performed</th>
                    <th style={{ padding: '10px 14px', color: 'var(--accent-green)', width: '200px' }}>Stack After</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trace.map((tr) => (
                    <tr key={tr.step} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 14px', color: 'var(--text-dim)' }}>{tr.step}</td>
                      <td className="code-font" style={{ padding: '8px 14px', color: '#fbbf24', fontWeight: '700' }}>
                        {tr.token}
                      </td>
                      <td className="code-font" style={{ padding: '8px 14px', color: 'var(--text-muted)' }}>
                        [{tr.stackBefore || 'empty'}]
                      </td>
                      <td style={{ padding: '8px 14px', color: '#e2e8f0' }}>
                        {tr.action}
                      </td>
                      <td className="code-font" style={{ padding: '8px 14px', color: '#34d399', fontWeight: '600' }}>
                        [{tr.stackAfter}]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
