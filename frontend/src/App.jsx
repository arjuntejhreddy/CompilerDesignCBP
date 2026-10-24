import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Editor from './components/Editor';
import FlowchartView from './components/FlowchartView';
import TokensTab from './components/TokensTab';
import AstTab from './components/AstTab';
import LL1Tab from './components/LL1Tab';
import LALRTab from './components/LALRTab';
import ExprEvalTab from './components/ExprEvalTab';
import IntermediateTab from './components/IntermediateTab';
import SymbolTableTab from './components/SymbolTableTab';
import DiagnosticsTab from './components/DiagnosticsTab';
import MermaidModal from './components/MermaidModal';
import { compilerApi } from './api/compilerApi';
import {
  Share2,
  Table,
  Layers,
  Compass,
  GitBranch,
  Calculator,
  Binary,
  Database,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState('factorial');
  const [code, setCode] = useState(`int n = 5;
int fact = 1;

while (n > 1) {
    fact = fact * n;
    n = n - 1;
}
`);
  const [loading, setLoading] = useState(false);
  const [compileResult, setCompileResult] = useState(null);
  const [activeTab, setActiveTab] = useState('flowchart');
  const [isMermaidOpen, setIsMermaidOpen] = useState(false);
  const [health, setHealth] = useState(null);
  const [autoCompile, setAutoCompile] = useState(true);

  const debounceTimerRef = useRef(null);

  // Load samples and health on mount
  useEffect(() => {
    async function init() {
      try {
        const [h, s] = await Promise.all([
          compilerApi.getHealth().catch(() => null),
          compilerApi.getSamples().catch(() => null)
        ]);
        if (h) setHealth(h);
        if (s && s.samples) {
          setSamples(s.samples);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  // Run compilation
  const runCompile = async (sourceCodeToCompile = code) => {
    setLoading(true);
    try {
      const res = await compilerApi.compile(sourceCodeToCompile);
      setCompileResult(res);
      if (res.errors && res.errors.length > 0 && activeTab === 'flowchart') {
        setActiveTab('diagnostics');
      }
    } catch (err) {
      console.error('Compile error:', err);
      setCompileResult({
        success: false,
        errors: [{ type: 'SYSTEM_ERROR', message: err.message, line: 1, col: 1 }]
      });
    } finally {
      setLoading(false);
    }
  };

  // Compile on mount immediately
  useEffect(() => {
    runCompile(code);
  }, []);

  // Keyboard shortcut: Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCompile(code);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  // Handle code change with fast live debouncing
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    if (autoCompile) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        runCompile(newCode);
      }, 250); // fast 250ms live update
    }
  };

  // Handle instant sample selection
  const handleSelectSample = (id) => {
    setSelectedSampleId(id);
    const sample = samples.find((s) => s.id === id);
    if (sample) {
      setCode(sample.code);
      runCompile(sample.code); // instantly compile selected sample
    }
  };

  const handleReset = () => {
    const sample = samples.find((s) => s.id === selectedSampleId);
    if (sample) {
      setCode(sample.code);
      runCompile(sample.code);
    }
  };

  const tabs = [
    { id: 'flowchart', label: 'Flowchart', icon: Share2, count: compileResult?.flowchart?.reactFlow?.nodes?.length },
    { id: 'tokens', label: 'Tokens', icon: Table, count: compileResult?.tokens?.length },
    { id: 'ast', label: 'AST', icon: Layers },
    { id: 'll1', label: 'LL(1) Parser', icon: Compass },
    { id: 'lalr', label: 'LALR(1) Parser', icon: GitBranch },
    { id: 'expr', label: 'Expression Eval', icon: Calculator },
    { id: 'intermediate', label: 'Intermediate Code', icon: Binary, count: compileResult?.tac?.lines?.length },
    { id: 'symbols', label: 'Symbol Table', icon: Database, count: compileResult?.symbolTable?.length },
    { id: 'diagnostics', label: 'Diagnostics', icon: AlertTriangle, count: compileResult?.errors?.length, badgeColor: compileResult?.errors?.length ? 'var(--accent-rose)' : null }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Navbar */}
      <Navbar
        samples={samples}
        selectedSampleId={selectedSampleId}
        onSelectSample={handleSelectSample}
        onCompile={() => runCompile(code)}
        onReset={handleReset}
        loading={loading}
        health={health}
        compilerEngine={compileResult?.engine}
        autoCompile={autoCompile}
        onToggleAutoCompile={() => setAutoCompile(!autoCompile)}
      />

      {/* Main Split Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Code Editor (40% width) */}
        <div style={{ width: '40%', height: '100%', minWidth: '380px' }}>
          <Editor
            code={code}
            onChange={handleCodeChange}
            errors={compileResult?.errors || []}
          />
        </div>

        {/* Right Side: Tabbed Compiler Output (60% width) */}
        <div style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-primary)',
          overflow: 'hidden'
        }}>
          {/* Tabs Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
            padding: '0 8px'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                    color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '500',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: tab.badgeColor || 'var(--bg-tertiary)',
                      color: tab.badgeColor ? '#ffffff' : 'var(--text-main)',
                      fontWeight: '700'
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {activeTab === 'flowchart' && (
              <FlowchartView
                nodes={compileResult?.flowchart?.reactFlow?.nodes || []}
                edges={compileResult?.flowchart?.reactFlow?.edges || []}
                mermaid={compileResult?.flowchart?.mermaid || ''}
                onOpenMermaid={() => setIsMermaidOpen(true)}
              />
            )}

            {activeTab === 'tokens' && (
              <TokensTab
                tokens={compileResult?.tokens || []}
                tokenStats={compileResult?.tokenStats || {}}
                errors={compileResult?.errors || []}
              />
            )}

            {activeTab === 'ast' && (
              <AstTab ast={compileResult?.ast} />
            )}

            {activeTab === 'll1' && (
              <LL1Tab />
            )}

            {activeTab === 'lalr' && (
              <LALRTab />
            )}

            {activeTab === 'expr' && (
              <ExprEvalTab />
            )}

            {activeTab === 'intermediate' && (
              <IntermediateTab
                tac={compileResult?.tac}
                assembly={compileResult?.assembly}
              />
            )}

            {activeTab === 'symbols' && (
              <SymbolTableTab
                symbolTable={compileResult?.symbolTable || []}
              />
            )}

            {activeTab === 'diagnostics' && (
              <DiagnosticsTab
                errors={compileResult?.errors || []}
                success={compileResult?.success}
                engine={compileResult?.engine}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mermaid Diagram Modal */}
      <MermaidModal
        isOpen={isMermaidOpen}
        onClose={() => setIsMermaidOpen(false)}
        mermaidCode={compileResult?.flowchart?.mermaid || ''}
      />
    </div>
  );
}
