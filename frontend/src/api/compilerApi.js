// API client for FlowCode Backend REST Services

const BASE_URL = '/api';

export const compilerApi = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getSamples() {
    const res = await fetch(`${BASE_URL}/samples`);
    if (!res.ok) throw new Error(`Failed to load samples: ${res.statusText}`);
    return res.json();
  },

  async compile(sourceCode) {
    const res = await fetch(`${BASE_URL}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceCode })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Compile failed: ${res.statusText}`);
    }
    return res.json();
  },

  async lex(sourceCode) {
    const res = await fetch(`${BASE_URL}/lex`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceCode })
    });
    if (!res.ok) throw new Error(`Lexical analysis failed: ${res.statusText}`);
    return res.json();
  },

  async parse(sourceCode) {
    const res = await fetch(`${BASE_URL}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceCode })
    });
    if (!res.ok) throw new Error(`Parse failed: ${res.statusText}`);
    return res.json();
  },

  async runLL1(expression) {
    const res = await fetch(`${BASE_URL}/ll1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression })
    });
    if (!res.ok) throw new Error(`LL(1) analysis failed: ${res.statusText}`);
    return res.json();
  },

  async runLALR(expression) {
    const res = await fetch(`${BASE_URL}/lalr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression })
    });
    if (!res.ok) throw new Error(`LALR analysis failed: ${res.statusText}`);
    return res.json();
  },

  async evaluateExpr(expression, variables = {}) {
    const res = await fetch(`${BASE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, variables })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Evaluation failed: ${res.statusText}`);
    }
    return res.json();
  }
};
