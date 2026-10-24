#ifndef TAC_H
#define TAC_H

#include "ast.h"

typedef struct TACInstr {
    char *op;       // "+", "-", "*", "/", "%", "==", "!=", "<", "<=", ">", ">=", "=", "if_false", "if_true", "goto", "label"
    char *arg1;
    char *arg2;
    char *result;
    struct TACInstr *next;
} TACInstr;

typedef struct TACContext {
    int temp_counter;
    int label_counter;
    TACInstr *head;
    TACInstr *tail;
} TACContext;

TACContext *create_tac_context();
void free_tac_context(TACContext *ctx);

char *new_temp(TACContext *ctx);
char *new_label(TACContext *ctx);

void emit_tac(TACContext *ctx, const char *op, const char *arg1, const char *arg2, const char *result);
char *generate_ast_tac(TACContext *ctx, ASTNode *node);
void generate_program_tac(TACContext *ctx, ASTNode *program);

void print_tac_json(FILE *out, TACContext *ctx);

#endif // TAC_H
