// Preset Sample Programs for Compiler Design Laboratory Demonstration

export const samplePrograms = [
  {
    id: 'factorial',
    title: 'Factorial Calculation (While Loop)',
    category: 'Loops & Accumulator',
    description: 'Computes factorial using a while loop with variable declarations, multiplication, and decrement.',
    code: `int n = 5;
int fact = 1;

while (n > 1) {
    fact = fact * n;
    n = n - 1;
}
`
  },
  {
    id: 'if_else_max',
    title: 'Maximum of Two Numbers (If-Else)',
    category: 'Conditional Branching',
    description: 'Compares two variables and assigns the maximum value using if-else construct.',
    code: `int a = 25;
int b = 40;
int max = 0;

if (a >= b) {
    max = a;
} else {
    max = b;
}
`
  },
  {
    id: 'sum_of_n',
    title: 'Sum of First N Numbers (While Loop)',
    category: 'Loops',
    description: 'Calculates the sum from 1 to N using an accumulator inside a while loop.',
    code: `int n = 10;
int sum = 0;
int i = 1;

while (i <= n) {
    sum = sum + i;
    i = i + 1;
}
`
  },
  {
    id: 'arithmetic_eval',
    title: 'Complex Arithmetic Expression',
    category: 'Operator Precedence',
    description: 'Tests operator precedence and associativity (+, -, *, /, %) with parentheses.',
    code: `int a = 12;
int b = 4;
int c = 3;
int result = 0;

result = a + b * c - (a / b) + 10;
`
  },
  {
    id: 'nested_control',
    title: 'Nested Conditions & Loops',
    category: 'Nested Structures',
    description: 'Demonstrates a while loop containing an internal if-else branch.',
    code: `int count = 1;
int evenCount = 0;
int oddCount = 0;

while (count <= 6) {
    if (count % 2 == 0) {
        evenCount = evenCount + 1;
    } else {
        oddCount = oddCount + 1;
    }
    count = count + 1;
}
`
  },
  {
    id: 'syntax_error',
    title: 'Syntax Error Test (Diagnostics Demo)',
    category: 'Error Diagnostics',
    description: 'Contains a missing semicolon and unmatched parenthesis to verify error reporting.',
    code: `int x = 10
int y = (x + 5;
`
  },
  {
    id: 'lexical_error',
    title: 'Lexical Error Test (Illegal Characters)',
    category: 'Error Diagnostics',
    description: 'Contains invalid lexical tokens (@ and $) to verify lexical error detection.',
    code: `int valid = 100;
int @invalid = 200;
`
  }
];
