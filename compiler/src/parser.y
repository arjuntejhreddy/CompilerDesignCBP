%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ast.h"

extern int yylex();
extern int yylineno;
extern int cur_col;
extern char *yytext;
void yyerror(const char *s);

ASTNode *root_ast = NULL;

typedef struct ErrorNode {
    char *message;
    int line;
    int col;
    struct ErrorNode *next;
} ErrorNode;

ErrorNode *error_list = NULL;

void record_error(const char *msg, int line, int col) {
    ErrorNode *node = (ErrorNode *)malloc(sizeof(ErrorNode));
    node->message = strdup(msg);
    node->line = line;
    node->col = col;
    node->next = error_list;
    error_list = node;
}

%}

%union {
    long int_val;
    double float_val;
    char char_val;
    char *str_val;
    ASTNode *node_val;
}

/* Tokens */
%token <str_val> INT_KW FLOAT_KW CHAR_KW
%token <str_val> IF ELSE WHILE
%token <str_val> IDENTIFIER
%token <int_val> INT_LITERAL
%token <float_val> FLOAT_LITERAL
%token <char_val> CHAR_LITERAL

%token ASSIGN SEMICOLON COMMA LPAREN RPAREN LBRACE RBRACE
%token PLUS MINUS STAR SLASH PERCENT
%token EQ NE LT LE GT GE AND OR NOT

%type <str_val> type_specifier
%type <node_val> program statement_list statement
%type <node_val> declaration assignment if_statement while_statement block
%type <node_val> expr logical_or_expr logical_and_expr equality_expr
%type <node_val> relational_expr additive_expr multiplicative_expr unary_expr primary_expr

%nonassoc LOWER_THAN_ELSE
%nonassoc ELSE

%start program

%%

program
    : statement_list {
        root_ast = create_program_node($1);
        $$ = root_ast;
    }
    | /* empty */ {
        root_ast = create_program_node(NULL);
        $$ = root_ast;
    }
    ;

statement_list
    : statement {
        $$ = $1;
    }
    | statement_list statement {
        $$ = append_statement($1, $2);
    }
    ;

statement
    : declaration { $$ = $1; }
    | assignment { $$ = $1; }
    | if_statement { $$ = $1; }
    | while_statement { $$ = $1; }
    | block { $$ = $1; }
    | SEMICOLON { $$ = NULL; }
    | error SEMICOLON {
        record_error("Syntax error in statement before semicolon", yylineno, cur_col);
        yyerrok;
        $$ = NULL;
    }
    ;

type_specifier
    : INT_KW   { $$ = $1; }
    | FLOAT_KW { $$ = $1; }
    | CHAR_KW  { $$ = $1; }
    ;

declaration
    : type_specifier IDENTIFIER SEMICOLON {
        $$ = create_var_decl_node($1, $2, NULL, yylineno, cur_col);
        free($1);
        free($2);
    }
    | type_specifier IDENTIFIER ASSIGN expr SEMICOLON {
        $$ = create_var_decl_node($1, $2, $4, yylineno, cur_col);
        free($1);
        free($2);
    }
    ;

assignment
    : IDENTIFIER ASSIGN expr SEMICOLON {
        $$ = create_assign_node($1, $3, yylineno, cur_col);
        free($1);
    }
    ;

if_statement
    : IF LPAREN expr RPAREN statement %prec LOWER_THAN_ELSE {
        $$ = create_if_node($3, $5, NULL, yylineno, cur_col);
    }
    | IF LPAREN expr RPAREN statement ELSE statement {
        $$ = create_if_node($3, $5, $7, yylineno, cur_col);
    }
    ;

while_statement
    : WHILE LPAREN expr RPAREN statement {
        $$ = create_while_node($3, $5, yylineno, cur_col);
    }
    ;

block
    : LBRACE statement_list RBRACE {
        $$ = create_block_node($2, yylineno, cur_col);
    }
    | LBRACE RBRACE {
        $$ = create_block_node(NULL, yylineno, cur_col);
    }
    ;

expr
    : logical_or_expr { $$ = $1; }
    ;

logical_or_expr
    : logical_and_expr { $$ = $1; }
    | logical_or_expr OR logical_and_expr {
        $$ = create_binary_op_node("||", $1, $3, yylineno, cur_col);
    }
    ;

logical_and_expr
    : equality_expr { $$ = $1; }
    | logical_and_expr AND equality_expr {
        $$ = create_binary_op_node("&&", $1, $3, yylineno, cur_col);
    }
    ;

equality_expr
    : relational_expr { $$ = $1; }
    | equality_expr EQ relational_expr {
        $$ = create_binary_op_node("==", $1, $3, yylineno, cur_col);
    }
    | equality_expr NE relational_expr {
        $$ = create_binary_op_node("!=", $1, $3, yylineno, cur_col);
    }
    ;

relational_expr
    : additive_expr { $$ = $1; }
    | relational_expr LT additive_expr {
        $$ = create_binary_op_node("<", $1, $3, yylineno, cur_col);
    }
    | relational_expr LE additive_expr {
        $$ = create_binary_op_node("<=", $1, $3, yylineno, cur_col);
    }
    | relational_expr GT additive_expr {
        $$ = create_binary_op_node(">", $1, $3, yylineno, cur_col);
    }
    | relational_expr GE additive_expr {
        $$ = create_binary_op_node(">=", $1, $3, yylineno, cur_col);
    }
    ;

additive_expr
    : multiplicative_expr { $$ = $1; }
    | additive_expr PLUS multiplicative_expr {
        $$ = create_binary_op_node("+", $1, $3, yylineno, cur_col);
    }
    | additive_expr MINUS multiplicative_expr {
        $$ = create_binary_op_node("-", $1, $3, yylineno, cur_col);
    }
    ;

multiplicative_expr
    : unary_expr { $$ = $1; }
    | multiplicative_expr STAR unary_expr {
        $$ = create_binary_op_node("*", $1, $3, yylineno, cur_col);
    }
    | multiplicative_expr SLASH unary_expr {
        $$ = create_binary_op_node("/", $1, $3, yylineno, cur_col);
    }
    | multiplicative_expr PERCENT unary_expr {
        $$ = create_binary_op_node("%", $1, $3, yylineno, cur_col);
    }
    ;

unary_expr
    : primary_expr { $$ = $1; }
    | MINUS unary_expr {
        $$ = create_unary_op_node("-", $2, yylineno, cur_col);
    }
    | PLUS unary_expr {
        $$ = $2;
    }
    | NOT unary_expr {
        $$ = create_unary_op_node("!", $2, yylineno, cur_col);
    }
    ;

primary_expr
    : IDENTIFIER {
        $$ = create_identifier_node($1, yylineno, cur_col);
        free($1);
    }
    | INT_LITERAL {
        $$ = create_int_literal_node($1, yylineno, cur_col);
    }
    | FLOAT_LITERAL {
        $$ = create_float_literal_node($1, yylineno, cur_col);
    }
    | CHAR_LITERAL {
        $$ = create_char_literal_node($1, yylineno, cur_col);
    }
    | LPAREN expr RPAREN {
        $$ = $2;
    }
    ;

%%

void yyerror(const char *s) {
    record_error(s, yylineno, cur_col);
}
