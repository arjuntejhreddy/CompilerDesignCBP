%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ast.h"
#include "parser.tab.h"

int cur_col = 1;

typedef struct TokenItem {
    char *type;
    char *lexeme;
    int line;
    int col;
    struct TokenItem *next;
} TokenItem;

TokenItem *token_stream_head = NULL;
TokenItem *token_stream_tail = NULL;

extern void record_error(const char *msg, int line, int col);

void record_token(const char *type, const char *lexeme, int line, int col) {
    TokenItem *item = (TokenItem *)calloc(1, sizeof(TokenItem));
    item->type = strdup(type);
    item->lexeme = strdup(lexeme);
    item->line = line;
    item->col = col;
    if (!token_stream_head) {
        token_stream_head = item;
        token_stream_tail = item;
    } else {
        token_stream_tail->next = item;
        token_stream_tail = item;
    }
}

#define YY_USER_ACTION \
    yylloc_first_line = yylineno; \
    yylloc_first_column = cur_col; \
    cur_col += yyleng;

int yylloc_first_line = 1;
int yylloc_first_column = 1;

%}

%option noyywrap
%option yylineno

%x COMMENT

%%

[ \t]+                  { /* ignore whitespace, col updated by YY_USER_ACTION */ }
\r\n|\n|\r              { cur_col = 1; }

"//".*                  { /* single line comment ignored */ }

"/*"                    { BEGIN(COMMENT); }
<COMMENT>"*/"           { BEGIN(INITIAL); }
<COMMENT>\n             { cur_col = 1; }
<COMMENT>.              { /* ignore comment body */ }
<COMMENT><<EOF>>        { record_error("Unterminated block comment", yylineno, cur_col); BEGIN(INITIAL); }

"int"                   { record_token("KEYWORD", yytext, yylineno, yylloc_first_column); yylval.str_val = strdup(yytext); return INT_KW; }
"float"                 { record_token("KEYWORD", yytext, yylineno, yylloc_first_column); yylval.str_val = strdup(yytext); return FLOAT_KW; }
"char"                  { record_token("KEYWORD", yytext, yylineno, yylloc_first_column); yylval.str_val = strdup(yytext); return CHAR_KW; }
"if"                    { record_token("KEYWORD", yytext, yylineno, yylloc_first_column); return IF; }
"else"                  { record_token("KEYWORD", yytext, yylineno, yylloc_first_column); return ELSE; }
"while"                 { record_token("KEYWORD", yytext, yylineno, yylloc_first_column); return WHILE; }

"+"                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return PLUS; }
"-"                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return MINUS; }
"*"                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return STAR; }
"/"                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return SLASH; }
"%"                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return PERCENT; }

"=="                    { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return EQ; }
"!="                    { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return NE; }
"<="                    { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return LE; }
">="                    { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return GE; }
"<"                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return LT; }
">"                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return GT; }

"&&"                    { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return AND; }
"||"                    { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return OR; }
"!"                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return NOT; }

"="                     { record_token("OPERATOR", yytext, yylineno, yylloc_first_column); return ASSIGN; }
";"                     { record_token("PUNCTUATOR", yytext, yylineno, yylloc_first_column); return SEMICOLON; }
","                     { record_token("PUNCTUATOR", yytext, yylineno, yylloc_first_column); return COMMA; }
"("                     { record_token("DELIMITER", yytext, yylineno, yylloc_first_column); return LPAREN; }
")"                     { record_token("DELIMITER", yytext, yylineno, yylloc_first_column); return RPAREN; }
"{"                     { record_token("DELIMITER", yytext, yylineno, yylloc_first_column); return LBRACE; }
"}"                     { record_token("DELIMITER", yytext, yylineno, yylloc_first_column); return RBRACE; }

[0-9]+\.[0-9]+          { record_token("FLOAT_LITERAL", yytext, yylineno, yylloc_first_column); yylval.float_val = atof(yytext); return FLOAT_LITERAL; }
[0-9]+                  { record_token("INT_LITERAL", yytext, yylineno, yylloc_first_column); yylval.int_val = atol(yytext); return INT_LITERAL; }
\'([^\'\\\n]|\\.)\'     { record_token("CHAR_LITERAL", yytext, yylineno, yylloc_first_column); yylval.char_val = yytext[1]; return CHAR_LITERAL; }

[a-zA-Z_][a-zA-Z0-9_]*  { record_token("IDENTIFIER", yytext, yylineno, yylloc_first_column); yylval.str_val = strdup(yytext); return IDENTIFIER; }

.                       {
                            char err[64];
                            snprintf(err, sizeof(err), "Lexical error: Unexpected character '%c' (0x%02X)", yytext[0], (unsigned char)yytext[0]);
                            record_error(err, yylineno, yylloc_first_column);
                        }

%%

void free_tokens() {
    TokenItem *curr = token_stream_head;
    while (curr) {
        TokenItem *next = curr->next;
        if (curr->type) free(curr->type);
        if (curr->lexeme) free(curr->lexeme);
        free(curr);
        curr = next;
    }
    token_stream_head = NULL;
    token_stream_tail = NULL;
}
