// LL(1) Parser Engine: FIRST, FOLLOW Sets, Parsing Table, and Predictive Parse Simulation

export class LL1ParserService {
  constructor(customGrammar = null) {
    // Default grammar: Arithmetic & Expression Grammar suited for LL(1)
    // E -> T E'
    // E' -> + T E' | - T E' | ε
    // T -> F T'
    // T' -> * F T' | / F T' | ε
    // F -> ( E ) | id | num
    this.grammar = customGrammar || {
      nonTerminals: ['E', "E'", 'T', "T'", 'F'],
      terminals: ['id', 'num', '+', '-', '*', '/', '(', ')', '$'],
      startSymbol: 'E',
      productions: [
        { lhs: 'E', rhs: ['T', "E'"] },
        { lhs: "E'", rhs: ['+', 'T', "E'"] },
        { lhs: "E'", rhs: ['-', 'T', "E'"] },
        { lhs: "E'", rhs: ['ε'] },
        { lhs: 'T', rhs: ['F', "T'"] },
        { lhs: "T'", rhs: ['*', 'F', "T'"] },
        { lhs: "T'", rhs: ['/', 'F', "T'"] },
        { lhs: "T'", rhs: ['ε'] },
        { lhs: 'F', rhs: ['(', 'E', ')'] },
        { lhs: 'F', rhs: ['id'] },
        { lhs: 'F', rhs: ['num'] }
      ]
    };

    this.firstSets = {};
    this.followSets = {};
    this.parseTable = {};
    this.conflicts = [];
    this.computeFirstAndFollow();
    this.buildParseTable();
  }

  // Compute FIRST for all non-terminals
  computeFirstAndFollow() {
    for (const nt of this.grammar.nonTerminals) {
      this.firstSets[nt] = new Set();
      this.followSets[nt] = new Set();
    }

    // Compute FIRST sets until no changes
    let changed = true;
    while (changed) {
      changed = false;
      for (const prod of this.grammar.productions) {
        const lhs = prod.lhs;
        const rhs = prod.rhs;
        const initialSize = this.firstSets[lhs].size;

        if (rhs.length === 1 && rhs[0] === 'ε') {
          this.firstSets[lhs].add('ε');
        } else {
          let allCanBeEmpty = true;
          for (const symbol of rhs) {
            if (this.grammar.terminals.includes(symbol)) {
              this.firstSets[lhs].add(symbol);
              allCanBeEmpty = false;
              break;
            } else if (this.grammar.nonTerminals.includes(symbol)) {
              const symFirst = this.firstSets[symbol];
              for (const item of symFirst) {
                if (item !== 'ε') this.firstSets[lhs].add(item);
              }
              if (!symFirst.has('ε')) {
                allCanBeEmpty = false;
                break;
              }
            }
          }
          if (allCanBeEmpty) {
            this.firstSets[lhs].add('ε');
          }
        }

        if (this.firstSets[lhs].size > initialSize) {
          changed = true;
        }
      }
    }

    // Compute FOLLOW sets
    this.followSets[this.grammar.startSymbol].add('$');

    changed = true;
    while (changed) {
      changed = false;
      for (const prod of this.grammar.productions) {
        const lhs = prod.lhs;
        const rhs = prod.rhs;

        for (let i = 0; i < rhs.length; i++) {
          const B = rhs[i];
          if (!this.grammar.nonTerminals.includes(B)) continue;

          const initialSize = this.followSets[B].size;
          const beta = rhs.slice(i + 1);

          if (beta.length > 0) {
            // First of beta
            let allBetaEmpty = true;
            for (const sym of beta) {
              if (this.grammar.terminals.includes(sym)) {
                this.followSets[B].add(sym);
                allBetaEmpty = false;
                break;
              } else if (this.grammar.nonTerminals.includes(sym)) {
                const symFirst = this.firstSets[sym];
                for (const item of symFirst) {
                  if (item !== 'ε') this.followSets[B].add(item);
                }
                if (!symFirst.has('ε')) {
                  allBetaEmpty = false;
                  break;
                }
              }
            }
            if (allBetaEmpty) {
              for (const item of this.followSets[lhs]) {
                this.followSets[B].add(item);
              }
            }
          } else {
            // beta is empty, so FOLLOW(B) includes FOLLOW(lhs)
            for (const item of this.followSets[lhs]) {
              this.followSets[B].add(item);
            }
          }

          if (this.followSets[B].size > initialSize) {
            changed = true;
          }
        }
      }
    }
  }

  // Get FIRST of a sequence of symbols
  firstOfSequence(symbols) {
    const result = new Set();
    if (symbols.length === 0 || (symbols.length === 1 && symbols[0] === 'ε')) {
      result.add('ε');
      return result;
    }

    let allCanBeEmpty = true;
    for (const sym of symbols) {
      if (this.grammar.terminals.includes(sym)) {
        result.add(sym);
        allCanBeEmpty = false;
        break;
      } else if (this.grammar.nonTerminals.includes(sym)) {
        const symFirst = this.firstSets[sym];
        for (const item of symFirst) {
          if (item !== 'ε') result.add(item);
        }
        if (!symFirst.has('ε')) {
          allCanBeEmpty = false;
          break;
        }
      }
    }

    if (allCanBeEmpty) {
      result.add('ε');
    }
    return result;
  }

  // Build LL(1) M-Table
  buildParseTable() {
    this.parseTable = {};
    this.conflicts = [];

    for (const nt of this.grammar.nonTerminals) {
      this.parseTable[nt] = {};
      for (const t of this.grammar.terminals) {
        if (t !== 'ε') {
          this.parseTable[nt][t] = null;
        }
      }
    }

    for (const prod of this.grammar.productions) {
      const lhs = prod.lhs;
      const firstRhs = this.firstOfSequence(prod.rhs);

      for (const terminal of firstRhs) {
        if (terminal !== 'ε') {
          if (this.parseTable[lhs][terminal]) {
            this.conflicts.push({
              nonTerminal: lhs,
              terminal,
              existing: this.parseTable[lhs][terminal],
              conflicting: prod
            });
          } else {
            this.parseTable[lhs][terminal] = prod;
          }
        }
      }

      if (firstRhs.has('ε')) {
        for (const b of this.followSets[lhs]) {
          if (this.parseTable[lhs][b]) {
            this.conflicts.push({
              nonTerminal: lhs,
              terminal: b,
              existing: this.parseTable[lhs][b],
              conflicting: prod
            });
          } else {
            this.parseTable[lhs][b] = prod;
          }
        }
      }
    }
  }

  // Tokenize an expression into LL(1) terminal symbols
  tokenizeExpression(inputStr) {
    const rawTokens = inputStr.trim().split(/\s+|([+*\/()\-]|id|num)/).filter(Boolean);
    const tokens = [];
    for (const t of rawTokens) {
      if (/^[0-9]+(\.[0-9]+)?$/.test(t)) {
        tokens.push('num');
      } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t)) {
        tokens.push('id');
      } else if (['+', '-', '*', '/', '(', ')'].includes(t)) {
        tokens.push(t);
      }
    }
    tokens.push('$');
    return tokens;
  }

  // Run Step-by-Step Predictive Parser Simulation
  simulate(inputExpr = 'id + num * id') {
    const inputTokens = this.tokenizeExpression(inputExpr);
    const stack = ['$', this.grammar.startSymbol];
    const trace = [];
    let ip = 0;
    let step = 1;
    let success = false;
    let error = null;

    const maxSteps = 100;

    while (stack.length > 0 && step <= maxSteps) {
      const top = stack[stack.length - 1];
      const currentToken = inputTokens[ip];
      const remainingInput = inputTokens.slice(ip).join(' ');
      const stackStr = stack.join(' ');

      if (top === '$' && currentToken === '$') {
        trace.push({
          step: step++,
          stack: stackStr,
          input: remainingInput,
          action: 'ACCEPT (Parsing completed successfully!)'
        });
        success = true;
        break;
      }

      if (top === currentToken) {
        trace.push({
          step: step++,
          stack: stackStr,
          input: remainingInput,
          action: `Match and pop terminal '${currentToken}'`
        });
        stack.pop();
        ip++;
        continue;
      }

      if (this.grammar.terminals.includes(top)) {
        error = `Terminal mismatch: Stack top '${top}' does not match input token '${currentToken}'`;
        trace.push({
          step: step++,
          stack: stackStr,
          input: remainingInput,
          action: `ERROR: ${error}`
        });
        break;
      }

      // Top is a non-terminal: look up parse table
      const prod = this.parseTable[top]?.[currentToken];
      if (!prod) {
        error = `Syntax Error: No production rule in M[${top}, ${currentToken}]`;
        trace.push({
          step: step++,
          stack: stackStr,
          input: remainingInput,
          action: `ERROR: ${error}`
        });
        break;
      }

      const prodStr = `${prod.lhs} -> ${prod.rhs.join(' ')}`;
      trace.push({
        step: step++,
        stack: stackStr,
        input: remainingInput,
        action: `Apply rule ${prodStr}`
      });

      stack.pop();
      if (!(prod.rhs.length === 1 && prod.rhs[0] === 'ε')) {
        for (let j = prod.rhs.length - 1; j >= 0; j--) {
          stack.push(prod.rhs[j]);
        }
      }
    }

    if (step > maxSteps) {
      error = 'Exceeded maximum parsing steps (possible infinite loop)';
    }

    // Format sets and table for UI
    const formattedFirst = {};
    for (const [k, v] of Object.entries(this.firstSets)) {
      formattedFirst[k] = Array.from(v);
    }

    const formattedFollow = {};
    for (const [k, v] of Object.entries(this.followSets)) {
      formattedFollow[k] = Array.from(v);
    }

    const formattedTable = {};
    for (const nt of this.grammar.nonTerminals) {
      formattedTable[nt] = {};
      for (const t of this.grammar.terminals) {
        if (t !== 'ε') {
          const p = this.parseTable[nt][t];
          formattedTable[nt][t] = p ? `${p.lhs} -> ${p.rhs.join(' ')}` : '-';
        }
      }
    }

    return {
      grammar: this.grammar,
      firstSets: formattedFirst,
      followSets: formattedFollow,
      parseTable: formattedTable,
      conflicts: this.conflicts,
      isLL1: this.conflicts.length === 0,
      inputExpr,
      tokens: inputTokens,
      trace,
      success,
      error
    };
  }
}
