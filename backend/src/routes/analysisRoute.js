import { Router } from 'express';
import { LL1ParserService } from '../services/ll1Parser.js';
import { LALRParserService } from '../services/lalrParser.js';
import { ExprEvaluatorService } from '../services/exprEvaluator.js';

const router = Router();
const ll1Service = new LL1ParserService();
const lalrService = new LALRParserService();
const exprService = new ExprEvaluatorService();

// POST /api/ll1 - FIRST & FOLLOW and Predictive Parsing simulation
router.post('/ll1', (req, res) => {
  try {
    const { expression } = req.body;
    const simResult = ll1Service.simulate(expression || 'id + num * id');
    res.json({
      success: simResult.success,
      data: simResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/lalr - LALR Action/Goto tables and shift-reduce simulation
router.post('/lalr', (req, res) => {
  try {
    const { expression } = req.body;
    const simResult = lalrService.simulate(expression || 'id + id * num');
    res.json({
      success: simResult.success,
      data: simResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/evaluate - Arithmetic expression evaluation
router.post('/evaluate', (req, res) => {
  try {
    const { expression, variables } = req.body;
    if (!expression) {
      return res.status(400).json({ success: false, error: 'expression is required' });
    }
    const result = exprService.evaluate(expression, variables || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
