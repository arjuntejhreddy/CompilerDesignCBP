import React from 'react';
import { Play, RotateCcw, Cpu, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function Navbar({
  samples,
  selectedSampleId,
  onSelectSample,
  onCompile,
  onReset,
  loading,
  health,
  compilerEngine,
  autoCompile,
  onToggleAutoCompile
}) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand & Project Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
        }}>
          <Cpu size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: '#ffffff' }}>
              FlowCode
            </h1>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-blue)',
              fontWeight: '600',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              CD Project
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Source Code to Flowchart & Compiler Phase Visualizer
          </p>
        </div>
      </div>

      {/* Center: Samples & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sample Program Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '500' }}>
            Presets:
          </span>
          <select
            value={selectedSampleId}
            onChange={(e) => onSelectSample(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Instant Auto-Compile Mode Toggle */}
        <button
          onClick={onToggleAutoCompile}
          title={autoCompile ? "Auto-Compile enabled: Updates live as you type" : "Click to enable Instant Auto-Compile"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: autoCompile ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
            color: autoCompile ? 'var(--accent-green)' : 'var(--text-muted)',
            border: `1px solid ${autoCompile ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <Zap size={14} fill={autoCompile ? "var(--accent-green)" : "none"} />
          {autoCompile ? 'Instant Live ON' : 'Instant Live OFF'}
        </button>

        {/* Compile Button */}
        <button
          onClick={() => onCompile()}
          disabled={loading}
          title="Shortcut: Ctrl + Enter"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '8px',
            backgroundImage: 'linear-gradient(135deg, #0284c7, #2563eb)',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '13px',
            border: 'none',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          <Play size={16} fill="#ffffff" />
          {loading ? 'Compiling...' : 'Compile (Ctrl+Enter)'}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          title="Reset code to default"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            fontSize: '13px',
            border: '1px solid var(--border-color)'
          }}
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      {/* Right: Engine & Health Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          fontSize: '12px',
          color: 'var(--accent-green)'
        }}>
          <CheckCircle2 size={14} />
          <span>{compilerEngine || 'Flex/Bison Engine'}</span>
        </div>
      </div>
    </header>
  );
}
