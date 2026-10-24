// LALR(1) Parser Engine (Demonstrating Bison/YACC Internals)
// Provides Grammar rules, Action/Goto Tables, Item Sets, and Step-by-Step Shift-Reduce Simulation

import fs from 'fs';
import path from 'path';

export class LALRParserService {
  constructor() {
    this.grammarRules = [
      { id: 0, lhs: "$accept", rhs: ["E", "$end"] },
      { id: 1, lhs: "E", rhs: ["E", "+", "T"] },
      { id: 2, lhs: "E", rhs: ["T"] },
      { id: 3, lhs: "T", rhs: ["T", "*", "F"] },
      { id: 4, lhs: "T", rhs: ["F"] },
      { id: 5, lhs: "F", rhs: ["(", "E", ")"] },
      { id: 6, lhs: "F", rhs: ["id"] },
      { id: 7, lhs: "F", rhs: ["num"] }
    ];

    this.terminals = ["id", "num", "+", "*", "(", ")", "$end"];
    this.nonTerminals = ["E", "T", "F"];

    // Canonical LALR / LR(0) / LR(1) Action and Goto table for expression grammar
    // States 0 to 11
    this.actionTable = {
      0:  { "id": "s5",  "num": "s6",  "(": "s4" },
      1:  { "+": "s7",   "$end": "acc" },
      2:  { "+": "r2",   "*": "s8",   ")": "r2",  "$end": "r2" },
      3:  { "+": "r4",   "*": "r4",   ")": "r4",  "$end": "r4" },
      4:  { "id": "s5",  "num": "s6",  "(": "s4" },
      5:  { "+": "r6",   "*": "r6",   ")": "r6",  "$end": "r6" },
      6:  { "+": "r7",   "*": "r7",   ")": "r7",  "$end": "r7" },
      7:  { "id": "s5",  "num": "s6",  "(": "s4" },
      8:  { "id": "s5",  "num": "s6",  "(": "s4" },
      9:  { "+": "s7",   ")": "s11" },
      10: { "+": "r1",   "*": "s8",   ")": "r1",  "$end": "r1" },
      11: { "+": "r5",   "*": "r5",   ")": "r5",  "$end": "r5" },
      12: { "+": "r3",   "*": "r3",   ")": "r3",  "$end": "r3" }
    };

    this.gotoTable = {
      0: { "E": 1, "T": 2, "F": 3 },
      4: { "E": 9, "T": 2, "F": 3 },
      7: { "T": 10, "F": 3 },
      8: { "F": 12 }
    };

    this.statesSummary = [
      {
        state: 0,
        items: [
          "$accept -> • E $end",
          "E -> • E + T",
          "E -> • T",
          "T -> • T * F",
          "T -> • F",
          "F -> • ( E )",
          "F -> • id",
          "F -> • num"
        ],
        transitions: { "E": 1, "T": 2, "F": 3, "id": 5, "num": 6, "(": 4 }
      },
      {
        state: 1,
        items: [
          "$accept -> E • $end",
          "E -> E • + T"
        ],
        transitions: { "+": 7, "$end": "accept" }
      },
      {
        state: 2,
        items: [
          "E -> T •",
          "T -> T • * F"
        ],
        transitions: { "*": 8, "+": "reduce 2", ")": "reduce 2", "$end": "reduce 2" }
      },
      {
        state: 3,
        items: [
          "T -> F •"
        ],
        transitions: { "+": "reduce 4", "*": "reduce 4", ")": "reduce 4", "$end": "reduce 4" }
      },
      {
        state: 4,
        items: [
          "F -> ( • E )",
          "E -> • E + T",
          "E -> • T",
          "T -> • T * F",
          "T -> • F",
          "F -> • ( E )",
          "F -> • id",
          "F -> • num"
        ],
        transitions: { "E": 9, "T": 2, "F": 3, "id": 5, "num": 6, "(": 4 }
      },
      {
        state: 5,
        items: ["F -> id •"],
        transitions: { "+": "reduce 6", "*": "reduce 6", ")": "reduce 6", "$end": "reduce 6" }
      },
      {
        state: 6,
        items: ["F -> num •"],
        transitions: { "+": "reduce 7", "*": "reduce 7", ")": "reduce 7", "$end": "reduce 7" }
      },
      {
        state: 7,
        items: [
          "E -> E + • T",
          "T -> • T * F",
          "T -> • F",
          "F -> • ( E )",
          "F -> • id",
          "F -> • num"
        ],
        transitions: { "T": 10, "F": 3, "id": 5, "num": 6, "(": 4 }
      },
      {
        state: 8,
        items: [
          "T -> T * • F",
          "F -> • ( E )",
          "F -> • id",
          "F -> • num"
        ],
        transitions: { "F": 12, "id": 5, "num": 6, "(": 4 }
      },
      {
        state: 9,
        items: [
          "F -> ( E • )",
          "E -> E • + T"
        ],
        transitions: { ")": 11, "+": 7 }
      },
      {
        state: 10,
        items: [
          "E -> E + T •",
          "T -> T • * F"
        ],
        transitions: { "*": 8, "+": "reduce 1", ")": "reduce 1", "$end": "reduce 1" }
      },
      {
        state: 11,
        items: ["F -> ( E ) •"],
        transitions: { "+": "reduce 5", "*": "reduce 5", ")": "reduce 5", "$end": "reduce 5" }
      },
      {
        state: 12,
        items: ["T -> T * F •"],
        transitions: { "+": "reduce 3", "*": "reduce 3", ")": "reduce 3", "$end": "reduce 3" }
      }
    ];
  }

  tokenizeInput(str) {
    const raw = str.trim().split(/\s+|([+*()\-]|id|num)/).filter(Boolean);
    const tokens = [];
    for (const t of raw) {
      if (/^[0-9]+(\.[0-9]+)?$/.test(t)) {
        tokens.push('num');
      } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t)) {
        tokens.push('id');
      } else if (['+', '*', '(', ')'].includes(t)) {
        tokens.push(t);
      }
    }
    tokens.push('$end');
    return tokens;
  }

  // Shift-Reduce Simulation
  simulate(inputExpr = 'id + id * num') {
    const tokens = this.tokenizeInput(inputExpr);
    const stateStack = [0];
    const symbolStack = ['$'];
    const trace = [];
    let ip = 0;
    let step = 1;
    let success = false;
    let error = null;

    const maxSteps = 100;

    while (step <= maxSteps) {
      const currentState = stateStack[stateStack.length - 1];
      const currentToken = tokens[ip] || '$end';
      const action = this.actionTable[currentState]?.[currentToken];

      const stateStr = stateStack.join(' ');
      const symbolStr = symbolStack.join(' ');
      const inputStr = tokens.slice(ip).join(' ');

      if (!action) {
        error = `Syntax Error: No action defined for State ${currentState} on symbol '${currentToken}'`;
        trace.push({
          step: step++,
          stateStack: stateStr,
          symbolStack: symbolStr,
          remainingInput: inputStr,
          action: `ERROR: ${error}`
        });
        break;
      }

      if (action === 'acc') {
        trace.push({
          step: step++,
          stateStack: stateStr,
          symbolStack: symbolStr,
          remainingInput: inputStr,
          action: 'ACCEPT (Program parsed successfully by LALR parser)'
        });
        success = true;
        break;
      }

      if (action.startsWith('s')) {
        const nextState = parseInt(action.slice(1), 10);
        trace.push({
          step: step++,
          stateStack: stateStr,
          symbolStack: symbolStr,
          remainingInput: inputStr,
          action: `Shift '${currentToken}', push state ${nextState} (Action: ${action})`
        });
        stateStack.push(nextState);
        symbolStack.push(currentToken);
        ip++;
      } else if (action.startsWith('r')) {
        const ruleId = parseInt(action.slice(1), 10);
        const rule = this.grammarRules.find(r => r.id === ruleId);
        if (!rule) {
          error = `Invalid reduction rule ${ruleId}`;
          break;
        }

        const popCount = rule.rhs.length;
        for (let k = 0; k < popCount; k++) {
          stateStack.pop();
          symbolStack.pop();
        }

        const topState = stateStack[stateStack.length - 1];
        const gotoState = this.gotoTable[topState]?.[rule.lhs];

        if (gotoState === undefined) {
          error = `Goto error: No entry in GOTO[${topState}, ${rule.lhs}]`;
          trace.push({
            step: step++,
            stateStack: stateStr,
            symbolStack: symbolStr,
            remainingInput: inputStr,
            action: `ERROR: ${error}`
          });
          break;
        }

        trace.push({
          step: step++,
          stateStack: stateStr,
          symbolStack: symbolStr,
          remainingInput: inputStr,
          action: `Reduce by rule ${rule.id}: ${rule.lhs} -> ${rule.rhs.join(' ')} (Goto[${topState}, ${rule.lhs}] = ${gotoState})`
        });

        stateStack.push(gotoState);
        symbolStack.push(rule.lhs);
      }
    }

    if (step > maxSteps) {
      error = 'Exceeded maximum shift-reduce steps';
    }

    return {
      grammarRules: this.grammarRules,
      terminals: this.terminals,
      nonTerminals: this.nonTerminals,
      statesSummary: this.statesSummary,
      actionTable: this.actionTable,
      gotoTable: this.gotoTable,
      inputExpr,
      tokens,
      trace,
      success,
      error
    };
  }
}
