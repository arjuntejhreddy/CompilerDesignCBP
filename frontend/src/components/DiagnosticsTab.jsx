import React from 'react';
import { AlertCircle, CheckCircle2, Info, Lightbulb, Terminal } from 'lucide-react';

export default function DiagnosticsTab({ errors = [], success = true, engine = '' }) {
  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Top Status Card */}
      <div style={{
        padding: '16px',
        backgroundColor: errors.length === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
        border: `1px solid ${errors.length === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {errors.length === 0 ? (
          <CheckCircle2 size={24} color="var(--accent-green)" />
        ) : (
          <AlertCircle size={24} color="var(--accent-rose)" />
        )}
        <div>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: errors.length === 0 ? 'var(--accent-green)' : 'var(--accent-rose)'
          }}>
            {errors.length === 0 ? 'Compilation Succeeded with 0 Errors' : `${errors.length} Compilation Diagnostic Errors`}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Compiler Engine: <strong>{engine || 'Flex/Bison Pipeline'}</strong>
          </p>
        </div>
      </div>

      {/* Errors List */}
      {errors.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {errors.map((err, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--accent-rose)',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: 'var(--accent-rose)'
                }}>
                  {err.type || 'SYNTAX_ERROR'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Line {err.line}, Column {err.col}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500', marginBottom: '8px' }}>
                {err.message}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#090d16',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                <Lightbulb size={14} color="var(--accent-amber)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  Check that statements terminate with semicolons (<code>;</code>), brackets are balanced, and identifiers are valid.
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '30px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc', marginBottom: '4px' }}>
            No Lexical or Syntax Errors!
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            The parser has successfully verified all tokens and constructed the Abstract Syntax Tree without errors.
          </p>
        </div>
      )}
    </div>
  );
}
