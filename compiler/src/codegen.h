#ifndef CODEGEN_H
#define CODEGEN_H

#include "tac.h"

typedef struct AsmInstr {
    char *text;
    char *comment;
    struct AsmInstr *next;
} AsmInstr;

typedef struct CodeGenContext {
    AsmInstr *head;
    AsmInstr *tail;
    int reg_counter;
} CodeGenContext;

CodeGenContext *create_codegen_context();
void free_codegen_context(CodeGenContext *ctx);

void generate_assembly(CodeGenContext *asm_ctx, TACContext *tac_ctx);
void print_assembly_json(FILE *out, CodeGenContext *ctx);

#endif // CODEGEN_H
