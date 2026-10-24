// Arithmetic Expression Validator, AST, Infix/Postfix/Prefix Converter, and Step-by-Step Evaluator

export class ExprEvaluatorService {
  constructor() {
    this.precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      '%': 2,
      '^': 3
    };
  }

  tokenize(expr) {
    const tokens = [];
    let i = 0;
    const s = expr.trim();

    while (i < s.length) {
      if (s[i] === ' ' || s[i] === '\t') {
        i++;
        continue;
      }

      // Check multi-digit number or float
      if (/[0-9]/.test(s[i])) {
        let numStr = '';
        while (i < s.length && /[0-9.]/.test(s[i])) {
          numStr += s[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr), raw: numStr });
        continue;
      }

      // Identifier
      if (/[a-zA-Z_]/.test(s[i])) {
        let idStr = '';
        while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) {
          idStr += s[i];
          i++;
        }
        tokens.push({ type: 'IDENTIFIER', value: idStr, raw: idStr });
        continue;
      }

      // Operators
      if (['+', '-', '*', '/', '%', '^'].includes(s[i])) {
        tokens.push({ type: 'OPERATOR', value: s[i], raw: s[i] });
        i++;
        continue;
      }

      // Parentheses
      if (['(', ')'].includes(s[i])) {
        tokens.push({ type: 'PAREN', value: s[i], raw: s[i] });
        i++;
        continue;
      }

      throw new Error(`Unexpected character '${s[i]}' in expression`);
    }

    return tokens;
  }

  // Convert Infix to Postfix (Shunting-Yard)
  toPostfix(tokens) {
    const output = [];
    const opStack = [];

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      if (tok.type === 'NUMBER' || tok.type === 'IDENTIFIER') {
        output.push(tok);
      } else if (tok.type === 'OPERATOR') {
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1].value !== '(' &&
          this.precedence[opStack[opStack.length - 1].value] >= this.precedence[tok.value]
        ) {
          output.push(opStack.pop());
        }
        opStack.push(tok);
      } else if (tok.value === '(') {
        opStack.push(tok);
      } else if (tok.value === ')') {
        let matched = false;
        while (opStack.length > 0) {
          const top = opStack.pop();
          if (top.value === '(') {
            matched = true;
            break;
          }
          output.push(top);
        }
        if (!matched) {
          throw new Error('Mismatched parentheses: closing parenthesis without matching opening');
        }
      }
    }

    while (opStack.length > 0) {
      const top = opStack.pop();
      if (top.value === '(' || top.value === ')') {
        throw new Error('Mismatched parentheses in expression');
      }
      output.push(top);
    }

    return output;
  }

  // Convert Infix to Prefix
  toPrefix(tokens) {
    // Reverse tokens, swap parens, run postfix, reverse output
    const reversed = [];
    for (let i = tokens.length - 1; i >= 0; i--) {
      const t = { ...tokens[i] };
      if (t.value === '(') t.value = ')';
      else if (t.value === ')') t.value = '(';
      reversed.push(t);
    }

    const output = [];
    const opStack = [];

    for (const tok of reversed) {
      if (tok.type === 'NUMBER' || tok.type === 'IDENTIFIER') {
        output.push(tok);
      } else if (tok.type === 'OPERATOR') {
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1].value !== '(' &&
          this.precedence[opStack[opStack.length - 1].value] > this.precedence[tok.value]
        ) {
          output.push(opStack.pop());
        }
        opStack.push(tok);
      } else if (tok.value === '(') {
        opStack.push(tok);
      } else if (tok.value === ')') {
        while (opStack.length > 0) {
          const top = opStack.pop();
          if (top.value === '(') break;
          output.push(top);
        }
      }
    }

    while (opStack.length > 0) {
      output.push(opStack.pop());
    }

    return output.reverse();
  }

  // Build Expression Tree from Postfix
  buildExpressionTree(postfixTokens) {
    const stack = [];

    for (const tok of postfixTokens) {
      if (tok.type === 'NUMBER' || tok.type === 'IDENTIFIER') {
        stack.push({
          nodeType: tok.type === 'NUMBER' ? 'Literal' : 'Variable',
          value: tok.value,
          left: null,
          right: null
        });
      } else if (tok.type === 'OPERATOR') {
        if (stack.length < 2) {
          throw new Error(`Insufficient operands for operator '${tok.value}'`);
        }
        const right = stack.pop();
        const left = stack.pop();
        stack.push({
          nodeType: 'Operator',
          op: tok.value,
          left,
          right
        });
      }
    }

    if (stack.length !== 1) {
      throw new Error('Malformed expression: extra operands');
    }

    return stack[0];
  }

  // Step-by-Step Evaluation of Postfix with variable bindings
  evaluate(expr, variableBindings = {}) {
    try {
      const tokens = this.tokenize(expr);
      const postfixTokens = this.toPostfix(tokens);
      const prefixTokens = this.toPrefix(tokens);
      const tree = this.buildExpressionTree(postfixTokens);

      const postfixStr = postfixTokens.map(t => t.raw).join(' ');
      const prefixStr = prefixTokens.map(t => t.raw).join(' ');

      const stack = [];
      const trace = [];
      let step = 1;

      for (const tok of postfixTokens) {
        const stackBefore = [...stack];

        if (tok.type === 'NUMBER') {
          stack.push(tok.value);
          trace.push({
            step: step++,
            token: tok.raw,
            action: `Push number ${tok.value}`,
            stackBefore: stackBefore.join(', '),
            stackAfter: stack.join(', ')
          });
        } else if (tok.type === 'IDENTIFIER') {
          const val = variableBindings[tok.value] !== undefined ? variableBindings[tok.value] : 1;
          stack.push(val);
          trace.push({
            step: step++,
            token: tok.raw,
            action: `Push variable '${tok.value}' (value: ${val})`,
            stackBefore: stackBefore.join(', '),
            stackAfter: stack.join(', ')
          });
        } else if (tok.type === 'OPERATOR') {
          const b = stack.pop();
          const a = stack.pop();
          let res = 0;

          switch (tok.value) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/':
              if (b === 0) throw new Error('Division by zero error');
              res = a / b;
              break;
            case '%': res = a % b; break;
            case '^': res = Math.pow(a, b); break;
          }

          stack.push(res);
          trace.push({
            step: step++,
            token: tok.raw,
            action: `Pop ${a} and ${b}, compute ${a} ${tok.value} ${b} = ${res}`,
            stackBefore: stackBefore.join(', '),
            stackAfter: stack.join(', ')
          });
        }
      }

      const finalResult = stack[0];

      return {
        success: true,
        expression: expr,
        infix: expr,
        postfix: postfixStr,
        prefix: prefixStr,
        result: finalResult,
        tree,
        trace,
        variables: variableBindings
      };
    } catch (err) {
      return {
        success: false,
        expression: expr,
        error: err.message
      };
    }
  }
}
