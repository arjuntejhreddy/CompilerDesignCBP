// Comprehensive Compiler Engine for FlowCode
// Implements Lexical Analysis, AST Generation, TAC, Quadruples, Triples, Pseudo-Assembly, Symbol Table, and CFG/Flowchart.

export class CompilerEngine {
  constructor(sourceCode) {
    this.source = sourceCode || '';
    this.tokens = [];
    this.errors = [];
    this.symbolTable = [];
    this.ast = null;
    this.tac = { lines: [], quadruples: [], triples: [] };
    this.assembly = [];
    this.flowchart = { nodes: [], edges: [] };
    this.tempCounter = 0;
    this.labelCounter = 0;
    this.nodeCounter = 0;
  }

  newTemp() {
    return `t${this.tempCounter++}`;
  }

  newLabel() {
    return `L${this.labelCounter++}`;
  }

  newNodeId() {
    return `n${this.nodeCounter++}`;
  }

  // ==========================================
  // 1. LEXICAL ANALYSIS (matches lexer.l)
  // ==========================================
  tokenize() {
    this.tokens = [];
    this.errors = [];

    const lines = this.source.split(/\r?\n/);
    let lineNum = 1;
    let inBlockComment = false;

    const keywords = new Set(['int', 'float', 'char', 'if', 'else', 'while']);
    const multiOps = ['==', '!=', '<=', '>=', '&&', '||'];
    const singleOps = ['+', '-', '*', '/', '%', '<', '>', '=', '!'];
    const delimiters = ['(', ')', '{', '}'];
    const punctuators = [';', ','];

    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      lineNum = l + 1;
      let col = 1;
      let i = 0;

      while (i < line.length) {
        // Block comment handling
        if (inBlockComment) {
          const endIdx = line.indexOf('*/', i);
          if (endIdx !== -1) {
            inBlockComment = false;
            col += (endIdx + 2 - i);
            i = endIdx + 2;
            continue;
          } else {
            break; // comment continues to next line
          }
        }

        // Whitespace
        if (line[i] === ' ' || line[i] === '\t') {
          col++;
          i++;
          continue;
        }

        // Line comment
        if (line.slice(i, i + 2) === '//') {
          break; // skip rest of line
        }

        // Start of block comment
        if (line.slice(i, i + 2) === '/*') {
          inBlockComment = true;
          i += 2;
          col += 2;
          continue;
        }

        // Multi-character operators
        const twoChar = line.slice(i, i + 2);
        if (multiOps.includes(twoChar)) {
          this.tokens.push({
            type: 'OPERATOR',
            lexeme: twoChar,
            line: lineNum,
            col: col
          });
          i += 2;
          col += 2;
          continue;
        }

        // Single character operators
        if (singleOps.includes(line[i])) {
          this.tokens.push({
            type: 'OPERATOR',
            lexeme: line[i],
            line: lineNum,
            col: col
          });
          i++;
          col++;
          continue;
        }

        // Delimiters
        if (delimiters.includes(line[i])) {
          this.tokens.push({
            type: 'DELIMITER',
            lexeme: line[i],
            line: lineNum,
            col: col
          });
          i++;
          col++;
          continue;
        }

        // Punctuators
        if (punctuators.includes(line[i])) {
          this.tokens.push({
            type: 'PUNCTUATOR',
            lexeme: line[i],
            line: lineNum,
            col: col
          });
          i++;
          col++;
          continue;
        }

        // Character literal
        if (line[i] === "'") {
          let endIdx = line.indexOf("'", i + 1);
          if (endIdx !== -1 && endIdx <= i + 3) {
            const lex = line.slice(i, endIdx + 1);
            this.tokens.push({
              type: 'CHAR_LITERAL',
              lexeme: lex,
              value: lex[1],
              line: lineNum,
              col: col
            });
            col += (endIdx + 1 - i);
            i = endIdx + 1;
            continue;
          } else {
            this.errors.push({
              type: 'LEXICAL_ERROR',
              message: `Unterminated character literal at line ${lineNum}, column ${col}`,
              line: lineNum,
              col: col
            });
            i++;
            col++;
            continue;
          }
        }

        // Numbers (Float or Integer)
        if (/[0-9]/.test(line[i])) {
          let numStr = '';
          const startCol = col;
          let isFloat = false;

          while (i < line.length && (/[0-9]/.test(line[i]) || (line[i] === '.' && !isFloat))) {
            if (line[i] === '.') isFloat = true;
            numStr += line[i];
            i++;
            col++;
          }

          this.tokens.push({
            type: isFloat ? 'FLOAT_LITERAL' : 'INT_LITERAL',
            lexeme: numStr,
            value: isFloat ? parseFloat(numStr) : parseInt(numStr, 10),
            line: lineNum,
            col: startCol
          });
          continue;
        }

        // Identifiers and Keywords
        if (/[a-zA-Z_]/.test(line[i])) {
          let idStr = '';
          const startCol = col;

          while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
            idStr += line[i];
            i++;
            col++;
          }

          if (keywords.has(idStr)) {
            this.tokens.push({
              type: 'KEYWORD',
              lexeme: idStr,
              line: lineNum,
              col: startCol
            });
          } else {
            this.tokens.push({
              type: 'IDENTIFIER',
              lexeme: idStr,
              line: lineNum,
              col: startCol
            });
          }
          continue;
        }

        // Lexical error: unexpected character
        this.errors.push({
          type: 'LEXICAL_ERROR',
          message: `Unexpected character '${line[i]}' (ASCII ${line.charCodeAt(i)})`,
          line: lineNum,
          col: col
        });
        i++;
        col++;
      }
    }

    if (inBlockComment) {
      this.errors.push({
        type: 'LEXICAL_ERROR',
        message: 'Unterminated block comment at end of input',
        line: lineNum,
        col: 1
      });
    }

    return {
      tokens: this.tokens,
      errors: this.errors,
      tokenStats: this.computeTokenStats()
    };
  }

  computeTokenStats() {
    const stats = {};
    for (const t of this.tokens) {
      stats[t.type] = (stats[t.type] || 0) + 1;
    }
    return stats;
  }

  // ==========================================
  // 2. SYNTAX ANALYSIS & AST (matches parser.y)
  // ==========================================
  parse() {
    this.tokenize();
    let pos = 0;

    const peek = (offset = 0) => this.tokens[pos + offset] || null;
    const consume = () => this.tokens[pos++] || null;
    const match = (type, lexeme) => {
      const tok = peek();
      if (!tok) return false;
      if (type && tok.type !== type) return false;
      if (lexeme && tok.lexeme !== lexeme) return false;
      return true;
    };

    const expect = (type, lexeme, contextMsg) => {
      if (match(type, lexeme)) {
        return consume();
      }
      const tok = peek();
      const errLine = tok ? tok.line : (this.tokens.length > 0 ? this.tokens[this.tokens.length - 1].line : 1);
      const errCol = tok ? tok.col : 1;
      const found = tok ? `'${tok.lexeme}' (${tok.type})` : 'end of input';
      const expected = lexeme ? `'${lexeme}'` : type;
      this.errors.push({
        type: 'SYNTAX_ERROR',
        message: `Expected ${expected} ${contextMsg ? 'in ' + contextMsg : ''}, but found ${found}`,
        line: errLine,
        col: errCol
      });
      return null;
    };

    const parsePrimary = () => {
      const tok = peek();
      if (!tok) return null;

      if (tok.type === 'INT_LITERAL') {
        consume();
        return {
          nodeType: 'IntegerLiteral',
          value: tok.value,
          line: tok.line,
          col: tok.col
        };
      }
      if (tok.type === 'FLOAT_LITERAL') {
        consume();
        return {
          nodeType: 'FloatLiteral',
          value: tok.value,
          line: tok.line,
          col: tok.col
        };
      }
      if (tok.type === 'CHAR_LITERAL') {
        consume();
        return {
          nodeType: 'CharLiteral',
          value: tok.value,
          line: tok.line,
          col: tok.col
        };
      }
      if (tok.type === 'IDENTIFIER') {
        consume();
        return {
          nodeType: 'Identifier',
          name: tok.lexeme,
          line: tok.line,
          col: tok.col
        };
      }
      if (match('DELIMITER', '(')) {
        consume();
        const expr = parseExpression();
        expect('DELIMITER', ')', 'parenthesized expression');
        return expr;
      }

      this.errors.push({
        type: 'SYNTAX_ERROR',
        message: `Unexpected token '${tok.lexeme}' in expression`,
        line: tok.line,
        col: tok.col
      });
      consume(); // advance to avoid infinite loop
      return null;
    };

    const parseUnary = () => {
      if (match('OPERATOR', '-') || match('OPERATOR', '+') || match('OPERATOR', '!')) {
        const op = consume();
        const operand = parseUnary();
        if (op.lexeme === '+') return operand;
        return {
          nodeType: 'UnaryExpr',
          op: op.lexeme,
          operand: operand,
          line: op.line,
          col: op.col
        };
      }
      return parsePrimary();
    };

    const parseMultiplicative = () => {
      let left = parseUnary();
      while (match('OPERATOR', '*') || match('OPERATOR', '/') || match('OPERATOR', '%')) {
        const op = consume();
        const right = parseUnary();
        left = {
          nodeType: 'BinaryExpr',
          op: op.lexeme,
          left,
          right,
          line: op.line,
          col: op.col
        };
      }
      return left;
    };

    const parseAdditive = () => {
      let left = parseMultiplicative();
      while (match('OPERATOR', '+') || match('OPERATOR', '-')) {
        const op = consume();
        const right = parseMultiplicative();
        left = {
          nodeType: 'BinaryExpr',
          op: op.lexeme,
          left,
          right,
          line: op.line,
          col: op.col
        };
      }
      return left;
    };

    const parseRelational = () => {
      let left = parseAdditive();
      while (match('OPERATOR', '<') || match('OPERATOR', '<=') || match('OPERATOR', '>') || match('OPERATOR', '>=')) {
        const op = consume();
        const right = parseAdditive();
        left = {
          nodeType: 'BinaryExpr',
          op: op.lexeme,
          left,
          right,
          line: op.line,
          col: op.col
        };
      }
      return left;
    };

    const parseEquality = () => {
      let left = parseRelational();
      while (match('OPERATOR', '==') || match('OPERATOR', '!=')) {
        const op = consume();
        const right = parseRelational();
        left = {
          nodeType: 'BinaryExpr',
          op: op.lexeme,
          left,
          right,
          line: op.line,
          col: op.col
        };
      }
      return left;
    };

    const parseLogicalAnd = () => {
      let left = parseEquality();
      while (match('OPERATOR', '&&')) {
        const op = consume();
        const right = parseEquality();
        left = {
          nodeType: 'BinaryExpr',
          op: op.lexeme,
          left,
          right,
          line: op.line,
          col: op.col
        };
      }
      return left;
    };

    const parseLogicalOr = () => {
      let left = parseLogicalAnd();
      while (match('OPERATOR', '||')) {
        const op = consume();
        const right = parseLogicalAnd();
        left = {
          nodeType: 'BinaryExpr',
          op: op.lexeme,
          left,
          right,
          line: op.line,
          col: op.col
        };
      }
      return left;
    };

    const parseExpression = () => {
      return parseLogicalOr();
    };

    const parseStatement = () => {
      const tok = peek();
      if (!tok) return null;

      // Semicolon alone
      if (match('PUNCTUATOR', ';')) {
        consume();
        return null;
      }

      // Variable declaration: int, float, char
      if (tok.type === 'KEYWORD' && ['int', 'float', 'char'].includes(tok.lexeme)) {
        const typeTok = consume();
        const idTok = expect('IDENTIFIER', null, 'variable declaration');
        if (!idTok) return null;

        let initExpr = null;
        if (match('OPERATOR', '=')) {
          consume();
          initExpr = parseExpression();
        }

        expect('PUNCTUATOR', ';', 'declaration');

        // Add to symbol table
        this.addSymbol(idTok.lexeme, typeTok.lexeme, typeTok.line);

        return {
          nodeType: 'VarDeclaration',
          dataType: typeTok.lexeme,
          name: idTok.lexeme,
          init: initExpr,
          line: typeTok.line,
          col: typeTok.col
        };
      }

      // Assignment: identifier = expr;
      if (tok.type === 'IDENTIFIER' && peek(1) && peek(1).lexeme === '=') {
        const idTok = consume();
        consume(); // '='
        const expr = parseExpression();
        expect('PUNCTUATOR', ';', 'assignment');

        return {
          nodeType: 'Assignment',
          name: idTok.lexeme,
          expr: expr,
          line: idTok.line,
          col: idTok.col
        };
      }

      // If Statement: if (cond) stmt [else stmt]
      if (match('KEYWORD', 'if')) {
        const ifTok = consume();
        expect('DELIMITER', '(', "if condition");
        const cond = parseExpression();
        expect('DELIMITER', ')', "if condition");
        const thenBranch = parseStatement();

        let elseBranch = null;
        if (match('KEYWORD', 'else')) {
          consume();
          elseBranch = parseStatement();
        }

        return {
          nodeType: 'IfStatement',
          condition: cond,
          thenBranch: thenBranch,
          elseBranch: elseBranch,
          line: ifTok.line,
          col: ifTok.col
        };
      }

      // While Statement: while (cond) stmt
      if (match('KEYWORD', 'while')) {
        const whileTok = consume();
        expect('DELIMITER', '(', "while condition");
        const cond = parseExpression();
        expect('DELIMITER', ')', "while condition");
        const body = parseStatement();

        return {
          nodeType: 'WhileStatement',
          condition: cond,
          body: body,
          line: whileTok.line,
          col: whileTok.col
        };
      }

      // Block: { ... }
      if (match('DELIMITER', '{')) {
        const openTok = consume();
        const stmts = [];
        while (peek() && !match('DELIMITER', '}')) {
          const s = parseStatement();
          if (s) stmts.push(s);
        }
        expect('DELIMITER', '}', 'block statement');
        return {
          nodeType: 'Block',
          statements: stmts,
          line: openTok.line,
          col: openTok.col
        };
      }

      // Unknown or error recovery: skip token to prevent freeze
      this.errors.push({
        type: 'SYNTAX_ERROR',
        message: `Unexpected token '${tok.lexeme}' at line ${tok.line}, column ${tok.col}`,
        line: tok.line,
        col: tok.col
      });
      consume();
      return null;
    };

    const statements = [];
    while (pos < this.tokens.length) {
      const stmt = parseStatement();
      if (stmt) statements.push(stmt);
    }

    this.ast = {
      nodeType: 'Program',
      body: statements,
      line: 1,
      col: 1
    };

    return this.ast;
  }

  addSymbol(name, type, line) {
    if (!this.symbolTable.find(s => s.name === name)) {
      this.symbolTable.push({
        name,
        type,
        line,
        scope: 'global',
        value: null
      });
    }
  }

  // ==========================================
  // 3. THREE-ADDRESS CODE & QUADRUPLES (tac.c)
  // ==========================================
  generateTAC() {
    this.tac = { lines: [], quadruples: [], triples: [] };
    this.tempCounter = 0;
    this.labelCounter = 0;

    const emit = (op, arg1 = null, arg2 = null, result = null) => {
      const idx = this.tac.quadruples.length;
      this.tac.quadruples.push({ index: idx, op, arg1, arg2, result });
      this.tac.triples.push({ index: idx, op, arg1, arg2 });

      if (op === 'label') {
        this.tac.lines.push(`${result}:`);
      } else if (op === 'goto') {
        this.tac.lines.push(`goto ${result}`);
      } else if (op === 'if_false') {
        this.tac.lines.push(`if_false ${arg1} goto ${result}`);
      } else if (op === 'if_true') {
        this.tac.lines.push(`if_true ${arg1} goto ${result}`);
      } else if (op === '=') {
        this.tac.lines.push(`${result} = ${arg1}`);
      } else if (arg2 !== null) {
        this.tac.lines.push(`${result} = ${arg1} ${op} ${arg2}`);
      } else {
        this.tac.lines.push(`${result} = ${op} ${arg1}`);
      }
    };

    const genExprTAC = (node) => {
      if (!node) return null;

      switch (node.nodeType) {
        case 'IntegerLiteral':
        case 'FloatLiteral':
          return String(node.value);
        case 'CharLiteral':
          return `'${node.value}'`;
        case 'Identifier':
          return node.name;
        case 'BinaryExpr': {
          const left = genExprTAC(node.left);
          const right = genExprTAC(node.right);
          const t = this.newTemp();
          emit(node.op, left, right, t);
          return t;
        }
        case 'UnaryExpr': {
          const operand = genExprTAC(node.operand);
          const t = this.newTemp();
          emit(node.op, operand, null, t);
          return t;
        }
        default:
          return null;
      }
    };

    const genStmtTAC = (stmt) => {
      if (!stmt) return;

      switch (stmt.nodeType) {
        case 'VarDeclaration': {
          if (stmt.init) {
            const val = genExprTAC(stmt.init);
            emit('=', val, null, stmt.name);
          }
          break;
        }
        case 'Assignment': {
          const val = genExprTAC(stmt.expr);
          emit('=', val, null, stmt.name);
          break;
        }
        case 'IfStatement': {
          const cond = genExprTAC(stmt.condition);
          const lblElse = this.newLabel();
          const lblEnd = this.newLabel();

          emit('if_false', cond, null, stmt.elseBranch ? lblElse : lblEnd);
          genStmtTAC(stmt.thenBranch);

          if (stmt.elseBranch) {
            emit('goto', null, null, lblEnd);
            emit('label', null, null, lblElse);
            genStmtTAC(stmt.elseBranch);
          }
          emit('label', null, null, lblEnd);
          break;
        }
        case 'WhileStatement': {
          const lblStart = this.newLabel();
          const lblEnd = this.newLabel();

          emit('label', null, null, lblStart);
          const cond = genExprTAC(stmt.condition);
          emit('if_false', cond, null, lblEnd);
          genStmtTAC(stmt.body);
          emit('goto', null, null, lblStart);
          emit('label', null, null, lblEnd);
          break;
        }
        case 'Block': {
          for (const s of stmt.statements || []) {
            genStmtTAC(s);
          }
          break;
        }
        case 'Program': {
          for (const s of stmt.body || []) {
            genStmtTAC(s);
          }
          break;
        }
      }
    };

    if (this.ast) {
      genStmtTAC(this.ast);
    }

    return this.tac;
  }

  // ==========================================
  // 4. PSEUDO-MACHINE ASSEMBLY (codegen.c)
  // ==========================================
  generateAssembly() {
    this.assembly = [];
    const emitAsm = (code, comment = '') => {
      this.assembly.push({ code, comment });
    };

    emitAsm('; --- FlowCode Generated Pseudo-Machine Code ---', '');
    emitAsm('SECTION .text', '');
    emitAsm('GLOBAL _start', '');
    emitAsm('_start:', 'Entry Point');

    for (const q of this.tac.quadruples) {
      if (q.op === 'label') {
        emitAsm(`${q.result}:`, 'Jump target');
      } else if (q.op === 'goto') {
        emitAsm(`    JMP ${q.result}`, 'Unconditional jump');
      } else if (q.op === 'if_false') {
        emitAsm(`    LOAD R0, ${q.arg1}`, 'Load condition flag');
        emitAsm(`    CMP R0, 0`, 'Check if false (zero)');
        emitAsm(`    JE ${q.result}`, 'Branch on condition false');
      } else if (q.op === 'if_true') {
        emitAsm(`    LOAD R0, ${q.arg1}`, 'Load condition flag');
        emitAsm(`    CMP R0, 0`, 'Compare with zero');
        emitAsm(`    JNE ${q.result}`, 'Branch on condition true');
      } else if (q.op === '=') {
        emitAsm(`    LOAD R0, ${q.arg1}`, 'Load value into accumulator');
        emitAsm(`    STORE ${q.result}, R0`, `Assign to ${q.result}`);
      } else if (['+', '-', '*', '/', '%'].includes(q.op)) {
        emitAsm(`    LOAD R1, ${q.arg1}`, 'Load left operand');
        emitAsm(`    LOAD R2, ${q.arg2}`, 'Load right operand');
        const opMap = { '+': 'ADD', '-': 'SUB', '*': 'MUL', '/': 'DIV', '%': 'MOD' };
        emitAsm(`    ${opMap[q.op]} R1, R2`, `Compute ${q.op}`);
        emitAsm(`    STORE ${q.result}, R1`, 'Store result in temporary');
      } else if (['==', '!=', '<', '<=', '>', '>='].includes(q.op)) {
        emitAsm(`    LOAD R1, ${q.arg1}`, 'Load left operand');
        emitAsm(`    LOAD R2, ${q.arg2}`, 'Load right operand');
        emitAsm(`    CMP R1, R2`, 'Compare operands');
        const cmpMap = {
          '==': 'SETE',
          '!=': 'SETNE',
          '<': 'SETL',
          '<=': 'SETLE',
          '>': 'SETG',
          '>=': 'SETGE'
        };
        emitAsm(`    ${cmpMap[q.op]} R0`, 'Set boolean flag');
        emitAsm(`    STORE ${q.result}, R0`, 'Store comparison result');
      } else {
        emitAsm(`    OP_${q.op} ${q.result}, ${q.arg1 || ''}, ${q.arg2 || ''}`, 'Generic instruction');
      }
    }

    emitAsm('    HALT', 'Terminate process');
    return this.assembly;
  }

  // ==========================================
  // 5. CONTROL FLOW GRAPH & FLOWCHART (cfg.c)
  // ==========================================
  generateFlowchart() {
    this.flowchart = { nodes: [], edges: [] };
    this.nodeCounter = 0;
    let edgeCounter = 0;

    const addNode = (type, label, code = '', shape = 'rectangle') => {
      const id = this.newNodeId();
      const node = { id, type, label, code, shape };
      this.flowchart.nodes.push(node);
      return node;
    };

    const addEdge = (source, target, label = '') => {
      const id = `e${edgeCounter++}`;
      this.flowchart.edges.push({ id, source, target, label });
    };

    const exprToString = (expr) => {
      if (!expr) return '';
      switch (expr.nodeType) {
        case 'IntegerLiteral':
        case 'FloatLiteral':
          return String(expr.value);
        case 'CharLiteral':
          return `'${expr.value}'`;
        case 'Identifier':
          return expr.name;
        case 'BinaryExpr':
          return `${exprToString(expr.left)} ${expr.op} ${exprToString(expr.right)}`;
        case 'UnaryExpr':
          return `${expr.op}${exprToString(expr.operand)}`;
        default:
          return '';
      }
    };

    const buildSubGraph = (stmt, currentIn) => {
      if (!stmt) return currentIn;

      switch (stmt.nodeType) {
        case 'VarDeclaration': {
          const initStr = stmt.init ? ` = ${exprToString(stmt.init)}` : '';
          const code = `${stmt.dataType} ${stmt.name}${initStr};`;
          const node = addNode('process', 'Declaration', code, 'rectangle');
          if (currentIn) addEdge(currentIn.id, node.id);
          return node;
        }
        case 'Assignment': {
          const code = `${stmt.name} = ${exprToString(stmt.expr)};`;
          const node = addNode('process', 'Assignment', code, 'rectangle');
          if (currentIn) addEdge(currentIn.id, node.id);
          return node;
        }
        case 'IfStatement': {
          const condCode = `if (${exprToString(stmt.condition)})`;
          const decisionNode = addNode('decision', 'Condition', condCode, 'diamond');
          if (currentIn) addEdge(currentIn.id, decisionNode.id);

          // Then branch
          let thenEnd = decisionNode;
          if (stmt.thenBranch) {
            if (stmt.thenBranch.nodeType === 'Block') {
              let prev = decisionNode;
              let isFirst = true;
              for (const s of stmt.thenBranch.statements || []) {
                if (isFirst) {
                  const firstNode = buildSubGraph(s, null);
                  addEdge(decisionNode.id, firstNode.id, 'true');
                  prev = firstNode;
                  isFirst = false;
                } else {
                  prev = buildSubGraph(s, prev);
                }
              }
              thenEnd = prev;
            } else {
              const bNode = buildSubGraph(stmt.thenBranch, null);
              addEdge(decisionNode.id, bNode.id, 'true');
              thenEnd = bNode;
            }
          }

          // Else branch
          let elseEnd = null;
          if (stmt.elseBranch) {
            if (stmt.elseBranch.nodeType === 'Block') {
              let prev = decisionNode;
              let isFirst = true;
              for (const s of stmt.elseBranch.statements || []) {
                if (isFirst) {
                  const firstNode = buildSubGraph(s, null);
                  addEdge(decisionNode.id, firstNode.id, 'false');
                  prev = firstNode;
                  isFirst = false;
                } else {
                  prev = buildSubGraph(s, prev);
                }
              }
              elseEnd = prev;
            } else {
              const bNode = buildSubGraph(stmt.elseBranch, null);
              addEdge(decisionNode.id, bNode.id, 'false');
              elseEnd = bNode;
            }
          }

          const mergeNode = addNode('connector', 'Merge', '', 'circle');
          if (thenEnd) addEdge(thenEnd.id, mergeNode.id);
          if (elseEnd) {
            addEdge(elseEnd.id, mergeNode.id);
          } else {
            addEdge(decisionNode.id, mergeNode.id, 'false');
          }
          return mergeNode;
        }
        case 'WhileStatement': {
          const condCode = `while (${exprToString(stmt.condition)})`;
          const loopHeader = addNode('decision', 'Loop Condition', condCode, 'diamond');
          if (currentIn) addEdge(currentIn.id, loopHeader.id);

          let bodyEnd = loopHeader;
          if (stmt.body) {
            if (stmt.body.nodeType === 'Block') {
              let prev = loopHeader;
              let isFirst = true;
              for (const s of stmt.body.statements || []) {
                if (isFirst) {
                  const firstNode = buildSubGraph(s, null);
                  addEdge(loopHeader.id, firstNode.id, 'true');
                  prev = firstNode;
                  isFirst = false;
                } else {
                  prev = buildSubGraph(s, prev);
                }
              }
              bodyEnd = prev;
            } else {
              const bNode = buildSubGraph(stmt.body, null);
              addEdge(loopHeader.id, bNode.id, 'true');
              bodyEnd = bNode;
            }
          }

          // Loop back edge!
          if (bodyEnd) addEdge(bodyEnd.id, loopHeader.id, 'loop_back');

          const loopExit = addNode('connector', 'Loop Exit', '', 'circle');
          addEdge(loopHeader.id, loopExit.id, 'false');
          return loopExit;
        }
        case 'Block': {
          let curr = currentIn;
          for (const s of stmt.statements || []) {
            curr = buildSubGraph(s, curr);
          }
          return curr;
        }
        default:
          return currentIn;
      }
    };

    const startNode = addNode('start', 'Start', 'Start Program', 'oval');
    let last = startNode;

    for (const stmt of this.ast?.body || []) {
      last = buildSubGraph(stmt, last);
    }

    const endNode = addNode('end', 'End', 'End Program', 'oval');
    if (last) addEdge(last.id, endNode.id);

    return this.flowchart;
  }

  // ==========================================
  // FULL COMPILE PIPELINE
  // ==========================================
  compile() {
    this.tokenize();
    this.parse();
    this.generateTAC();
    this.generateAssembly();
    this.generateFlowchart();

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      tokens: this.tokens,
      tokenStats: this.computeTokenStats(),
      ast: this.ast,
      symbolTable: this.symbolTable,
      tac: this.tac,
      assembly: this.assembly,
      flowchart: this.flowchart
    };
  }
}
