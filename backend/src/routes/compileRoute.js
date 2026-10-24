import { Router } from 'express';
import { NativeCompilerRunner } from '../services/nativeCompiler.js';
import { CompilerEngine } from '../services/compilerEngine.js';
import { FlowchartBuilder } from '../services/flowchartBuilder.js';

const router = Router();
const runner = new NativeCompilerRunner();

// POST /api/compile - Full compilation pipeline
router.post('/compile', async (req, res) => {
  try {
    const { sourceCode } = req.body;
    if (typeof sourceCode !== 'string') {
      return res.status(400).json({ success: false, error: 'sourceCode must be a string' });
    }

    const compileResult = await runner.run(sourceCode);
    const flowchartData = FlowchartBuilder.buildReactFlow(compileResult.flowchart);

    res.json({
      success: compileResult.success,
      engine: compileResult.engine,
      errors: compileResult.errors || [],
      tokens: compileResult.tokens || [],
      tokenStats: compileResult.tokenStats || {},
      ast: compileResult.ast,
      symbolTable: compileResult.symbolTable || [],
      tac: compileResult.tac || { lines: [], quadruples: [] },
      assembly: compileResult.assembly || [],
      flowchart: {
        raw: compileResult.flowchart,
        reactFlow: {
          nodes: flowchartData.nodes,
          edges: flowchartData.edges
        },
        mermaid: flowchartData.mermaid
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/lex - Lexical analysis only
router.post('/lex', (req, res) => {
  try {
    const { sourceCode } = req.body;
    const engine = new CompilerEngine(sourceCode || '');
    const result = engine.tokenize();
    res.json({
      success: result.errors.length === 0,
      tokens: result.tokens,
      errors: result.errors,
      tokenStats: result.tokenStats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/parse - Syntax analysis only
router.post('/parse', (req, res) => {
  try {
    const { sourceCode } = req.body;
    const engine = new CompilerEngine(sourceCode || '');
    const ast = engine.parse();
    res.json({
      success: engine.errors.length === 0,
      ast: ast,
      errors: engine.errors
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
