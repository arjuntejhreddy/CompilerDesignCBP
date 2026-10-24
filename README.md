
# FlowCode — Source Code to Flowchart Generator
> **Compiler Design Laboratory Course Project**  
> An interactive full-stack web application that translates a restricted C-like programming language into interactive flowcharts while visualizing all classical compiler phases.

---

## 🌟 Overview & Key Features

FlowCode provides an educational workbench for understanding compiler design principles:

1. **Restricted C Code Editor**:
   - Accepts variable declarations (`int`, `float`, `char`), assignments, arithmetic/relational/logical expressions, `if-else` branching, and `while` loops.
   - Includes real-time syntax validation, line numbers, cursor coordinate tracking, and error annotations.

2. **Lexical Analysis (Scanner)**:
   - Implemented in **Flex/Lex** (`compiler/src/lexer.l`) and mirrored in Node.js.
   - Categorizes tokens into `KEYWORD`, `IDENTIFIER`, `INT_LITERAL`, `FLOAT_LITERAL`, `CHAR_LITERAL`, `OPERATOR`, `DELIMITER`, and `PUNCTUATOR`.
   - Accurately tracks lines, column offsets, and reports lexical errors (e.g. invalid ASCII characters, unterminated comments).

3. **Syntax Analysis & AST Construction (Parser)**:
   - Implemented in **Bison/YACC** (`compiler/src/parser.y`) with an LALR(1) context-free grammar.
   - Builds a clean Abstract Syntax Tree (AST) representing declarations, assignments, operations, conditions, and loops.
   - Provides an interactive visual expandable tree explorer and raw JSON inspector.

4. **FIRST & FOLLOW Set Computation and LL(1) Predictive Parser**:
   - Computes FIRST and FOLLOW sets automatically for grammar non-terminals.
   - Constructs the LL(1) Parsing Table ($M$-Table) and checks for LL(1) conflicts.
   - Simulates predictive parsing step-by-step: Stack, Input Remaining, and Production Rule applied.

5. **LALR(1) Parser Demonstration (Bison / YACC Internals)**:
   - Displays canonical collection of LR item sets and state numbers.
   - Displays LALR ACTION table (shift $s_n$, reduce $r_m$, accept) and GOTO table.
   - Simulates shift-reduce parsing step-by-step: State Stack, Symbol Stack, Remaining Input, and Action.

6. **Arithmetic Expression Validator & Evaluator**:
   - Parses arithmetic expressions respecting standard operator precedence and associativity ($()$, $*$, $/$, $\%$, $+$, $-$).
   - Generates **Infix**, **Postfix (Reverse Polish Notation)**, and **Prefix** representations.
   - Simulates step-by-step operand stack evaluation.

7. **Intermediate Code & Target Code Generation**:
   - Emits linear **Three-Address Code (TAC)** with temporary variables ($t_0, t_1\dots$) and jump labels ($L_0, L_1\dots$).
   - Generates **Quadruples Table** `(Index, Op, Arg1, Arg2, Result)` and **Triples Table**.
   - Generates simulated **Pseudo-Machine Assembly Instructions** (`LOAD`, `STORE`, `ADD`, `SUB`, `MUL`, `DIV`, `CMP`, `JE`, `JNE`, `JMP`, `HALT`).

8. **Interactive Flowchart Generator**:
   - Automatically maps Control Flow Graph (CFG) basic blocks to flowchart primitives:
     - **Start / End**: Oval/Pill terminal nodes.
     - **Declarations & Assignments**: Rectangle process blocks.
     - **If & While Conditions**: Diamond decision nodes with labeled `true` (green) and `false` (red) edges.
     - **While Loops**: Backward loop edges connecting body to loop headers.
     - **Merge Points**: Circular connector join nodes.
   - Rendered using **React Flow** (`@xyflow/react`) with zoom, pan, minimap, controls, and **Mermaid.js** syntax modal.

9. **REST API Architecture**:
   - Clean, decoupled Express.js REST APIs with JSON payloads.
   - Safe subprocess execution with strict timeouts ($3000\text{ ms}$) and memory limits.

---

## 🗂️ Project Directory Structure

```
CD PROJECT/
├── compiler/                     # Real C, Flex & Bison compiler engine
│   ├── src/
│   │   ├── lexer.l               # Flex token rules & lexical error detection
│   │   ├── parser.y              # Bison LALR(1) grammar specification
│   │   ├── ast.h / ast.c         # Abstract Syntax Tree nodes & JSON serializer
│   │   ├── tac.h / tac.c         # Three-Address Code & Quadruples generator
│   │   ├── codegen.h / codegen.c # Pseudo-machine assembly generator
│   │   ├── cfg.h / cfg.c         # Control Flow Graph extraction
│   │   ├── main.c                # Compiler CLI entry point
│   │   ├── parser.tab.c / .h     # Bison-generated C source files
│   │   ├── parser.output         # Bison LALR state machine & item sets report
│   │   └── lex.yy.c              # Flex-generated C scanner
│   ├── build.bat                 # Automated Flex & Bison build script
│   └── build/                    # Native compiler executable output
│
├── backend/                      # Node.js + Express REST API Service
│   ├── src/
│   │   ├── server.js             # Express application entry point (Port 5000)
│   │   ├── routes/
│   │   │   ├── compileRoute.js   # /api/compile, /api/lex, /api/parse
│   │   │   ├── analysisRoute.js  # /api/ll1, /api/lalr, /api/evaluate
│   │   │   └── samplesRoute.js   # /api/samples
│   │   └── services/
│   │       ├── compilerEngine.js # Full compiler engine (lex, parse, ast, tac, cfg)
│   │       ├── nativeCompiler.js # Native process runner with timeout sandbox
│   │       ├── ll1Parser.js      # FIRST/FOLLOW & LL(1) predictive parse simulator
│   │       ├── lalrParser.js     # LALR Action/Goto tables & shift-reduce simulator
│   │       ├── exprEvaluator.js  # Arithmetic expression validator & stack evaluator
│   │       └── flowchartBuilder.js # React Flow & Mermaid graph layout builder
│   ├── samples/
│   │   └── samplePrograms.js     # 7 built-in benchmark and error programs
│   └── package.json
│
├── frontend/                     # React.js SPA (Vite + React Flow)
│   ├── src/
│   │   ├── App.jsx               # Main split dashboard with 9 compiler tabs
│   │   ├── main.jsx              # React DOM entry point
│   │   ├── api/
│   │   │   └── compilerApi.js    # REST API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Header with sample selector & compile action
│   │   │   ├── Editor.jsx        # Code editor with line numbers & error markers
│   │   │   ├── FlowchartView.jsx # React Flow canvas with custom styled nodes
│   │   │   ├── MermaidModal.jsx  # Mermaid diagram & syntax exporter
│   │   │   ├── TokensTab.jsx     # Lexical analysis tokens table & statistics
│   │   │   ├── AstTab.jsx        # Visual AST tree explorer & JSON inspector
│   │   │   ├── LL1Tab.jsx        # FIRST/FOLLOW sets, M-Table, and LL(1) trace
│   │   │   ├── LALRTab.jsx       # Bison rules, item sets, Action/Goto, LR trace
│   │   │   ├── ExprEvalTab.jsx   # Infix, Postfix, Prefix & stack evaluation
│   │   │   ├── IntermediateTab.jsx # Three-Address Code, Quadruples & Assembly
│   │   │   ├── SymbolTableTab.jsx# Identifier table
│   │   │   └── DiagnosticsTab.jsx# Error diagnostics & recovery advice
│   │   └── styles/
│   │       └── index.css         # Dark theme design system & node styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md                     # Full documentation & run instructions
```

---

## 🚀 Installation & Running the Project

### Prerequisites
- **Node.js** (v18.x or newer) and **npm**
- *(Optional for C binary compilation)*: **WinFlexBison** (`win_flex`, `win_bison`) and GCC.

### 1. Run the Backend Service
In a terminal, navigate to the `backend` folder and start the server:
```bash
cd backend
npm install
npm start
```
The backend will launch on `http://localhost:5000`.

### 2. Run the Frontend Application
In a separate terminal, navigate to the `frontend` folder and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🛠️ Rebuilding the C Flex & Bison Compiler Engine

To re-run Flex and Bison over `lexer.l` and `parser.y`:
```cmd
compiler\build.bat
```
This automatically invokes `win_bison` and `win_flex` to generate `parser.tab.c`, `parser.tab.h`, `parser.output`, and `lex.yy.c`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and native compiler availability |
| `GET` | `/api/samples` | Retrieves 7 built-in benchmark programs |
| `POST` | `/api/compile` | Executes full compilation pipeline: tokens, AST, TAC, quadruples, assembly, flowchart |
| `POST` | `/api/lex` | Runs lexical analysis only and returns token distribution |
| `POST` | `/api/parse` | Runs syntax analysis only and returns AST |
| `POST` | `/api/ll1` | Computes FIRST/FOLLOW sets, LL(1) M-table, and simulates predictive parse trace |
| `POST` | `/api/lalr` | Returns LALR item sets, Action/Goto tables, and shift-reduce parse trace |
| `POST` | `/api/evaluate`| Evaluates arithmetic expressions, returning Infix, Postfix, Prefix, and operand stack trace |

---

## 📋 Preset Sample Programs Included

1. **Factorial Calculation (`factorial`)**:
   - Variable declarations, `while` loop, accumulator multiplication, decrement.
2. **Maximum of Two Numbers (`if_else_max`)**:
   - `if-else` branching, comparison operator (`>=`), variable assignments in branches, merge node.
3. **Sum of First N Numbers (`sum_of_n`)**:
   - While loop with addition accumulation and loop back-edge.
4. **Complex Arithmetic Expression (`arithmetic_eval`)**:
   - Expression with precedence: `result = a + b * c - (a / b) + 10;`.
5. **Nested Conditions & Loops (`nested_control`)**:
   - While loop with internal `if-else` checking modulo `%`.
6. **Syntax Error Test (`syntax_error`)**:
   - Demonstrates syntax error detection for missing semicolons and unclosed parentheses.
7. **Lexical Error Test (`lexical_error`)**:
   - Demonstrates lexical error detection for illegal characters (`@`).

