#include "codegen.h"

static char *safe_strdup(const char *s) {
    if (!s) return NULL;
    char *res = (char *)malloc(strlen(s) + 1);
    if (res) strcpy(res, s);
    return res;
}

CodeGenContext *create_codegen_context() {
    CodeGenContext *ctx = (CodeGenContext *)calloc(1, sizeof(CodeGenContext));
    ctx->reg_counter = 0;
    return ctx;
}

void free_codegen_context(CodeGenContext *ctx) {
    if (!ctx) return;
    AsmInstr *curr = ctx->head;
    while (curr) {
        AsmInstr *next = curr->next;
        if (curr->text) free(curr->text);
        if (curr->comment) free(curr->comment);
        free(curr);
        curr = next;
    }
    free(ctx);
}

static void emit_asm(CodeGenContext *ctx, const char *text, const char *comment) {
    AsmInstr *instr = (AsmInstr *)calloc(1, sizeof(AsmInstr));
    instr->text = safe_strdup(text);
    instr->comment = safe_strdup(comment);
    
    if (!ctx->head) {
        ctx->head = instr;
        ctx->tail = instr;
    } else {
        ctx->tail->next = instr;
        ctx->tail = instr;
    }
}

void generate_assembly(CodeGenContext *asm_ctx, TACContext *tac_ctx) {
    if (!asm_ctx || !tac_ctx) return;
    
    emit_asm(asm_ctx, "; --- Begin Generated Pseudo-Machine Code ---", "");
    emit_asm(asm_ctx, "SECTION .text", "");
    emit_asm(asm_ctx, "GLOBAL _start", "");
    emit_asm(asm_ctx, "_start:", "Entry point");
    
    TACInstr *curr = tac_ctx->head;
    char buf[128];
    char comment[128];
    
    while (curr) {
        if (strcmp(curr->op, "label") == 0) {
            snprintf(buf, sizeof(buf), "%s:", curr->result);
            emit_asm(asm_ctx, buf, "Label definition");
        } else if (strcmp(curr->op, "goto") == 0) {
            snprintf(buf, sizeof(buf), "    JMP %s", curr->result);
            emit_asm(asm_ctx, buf, "Unconditional jump");
        } else if (strcmp(curr->op, "if_false") == 0) {
            snprintf(buf, sizeof(buf), "    LOAD R0, %s", curr->arg1);
            emit_asm(asm_ctx, buf, "Check condition flag");
            emit_asm(asm_ctx, "    CMP R0, 0", "Compare with zero (false)");
            snprintf(buf, sizeof(buf), "    JE %s", curr->result);
            emit_asm(asm_ctx, buf, "Jump if condition is false");
        } else if (strcmp(curr->op, "if_true") == 0) {
            snprintf(buf, sizeof(buf), "    LOAD R0, %s", curr->arg1);
            emit_asm(asm_ctx, buf, "Check condition flag");
            emit_asm(asm_ctx, "    CMP R0, 0", "Compare with zero");
            snprintf(buf, sizeof(buf), "    JNE %s", curr->result);
            emit_asm(asm_ctx, buf, "Jump if condition is true");
        } else if (strcmp(curr->op, "=") == 0) {
            snprintf(buf, sizeof(buf), "    LOAD R0, %s", curr->arg1);
            snprintf(comment, sizeof(comment), "Load value into accumulator");
            emit_asm(asm_ctx, buf, comment);
            
            snprintf(buf, sizeof(buf), "    STORE %s, R0", curr->result);
            snprintf(comment, sizeof(comment), "Assign to variable %s", curr->result);
            emit_asm(asm_ctx, buf, comment);
        } else if (strcmp(curr->op, "+") == 0 || strcmp(curr->op, "-") == 0 ||
                   strcmp(curr->op, "*") == 0 || strcmp(curr->op, "/") == 0 ||
                   strcmp(curr->op, "%") == 0) {
            snprintf(buf, sizeof(buf), "    LOAD R1, %s", curr->arg1);
            emit_asm(asm_ctx, buf, "Load left operand");
            
            snprintf(buf, sizeof(buf), "    LOAD R2, %s", curr->arg2);
            emit_asm(asm_ctx, buf, "Load right operand");
            
            const char *asm_op = "ADD";
            if (strcmp(curr->op, "-") == 0) asm_op = "SUB";
            else if (strcmp(curr->op, "*") == 0) asm_op = "MUL";
            else if (strcmp(curr->op, "/") == 0) asm_op = "DIV";
            else if (strcmp(curr->op, "%") == 0) asm_op = "MOD";
            
            snprintf(buf, sizeof(buf), "    %s R1, R2", asm_op);
            emit_asm(asm_ctx, buf, "Compute binary arithmetic");
            
            snprintf(buf, sizeof(buf), "    STORE %s, R1", curr->result);
            emit_asm(asm_ctx, buf, "Store result in temporary");
        } else if (strcmp(curr->op, "==") == 0 || strcmp(curr->op, "!=") == 0 ||
                   strcmp(curr->op, "<") == 0  || strcmp(curr->op, "<=") == 0 ||
                   strcmp(curr->op, ">") == 0  || strcmp(curr->op, ">=") == 0) {
            snprintf(buf, sizeof(buf), "    LOAD R1, %s", curr->arg1);
            emit_asm(asm_ctx, buf, "Load left operand");
            
            snprintf(buf, sizeof(buf), "    LOAD R2, %s", curr->arg2);
            emit_asm(asm_ctx, buf, "Load right operand");
            
            emit_asm(asm_ctx, "    CMP R1, R2", "Compare operands");
            
            const char *set_op = "SETE";
            if (strcmp(curr->op, "!=") == 0) set_op = "SETNE";
            else if (strcmp(curr->op, "<") == 0) set_op = "SETL";
            else if (strcmp(curr->op, "<=") == 0) set_op = "SETLE";
            else if (strcmp(curr->op, ">") == 0) set_op = "SETG";
            else if (strcmp(curr->op, ">=") == 0) set_op = "SETGE";
            
            snprintf(buf, sizeof(buf), "    %s R0", set_op);
            emit_asm(asm_ctx, buf, "Set boolean flag (0 or 1)");
            
            snprintf(buf, sizeof(buf), "    STORE %s, R0", curr->result);
            emit_asm(asm_ctx, buf, "Store boolean condition");
        } else {
            snprintf(buf, sizeof(buf), "    OP_%s %s, %s, %s", curr->op, curr->result, curr->arg1 ? curr->arg1 : "", curr->arg2 ? curr->arg2 : "");
            emit_asm(asm_ctx, buf, "Generic operation");
        }
        
        curr = curr->next;
    }
    
    emit_asm(asm_ctx, "    HALT", "Terminate execution");
}

static void escape_json_str(FILE *out, const char *s) {
    if (!s) return;
    for (size_t i = 0; s[i] != '\0'; i++) {
        if (s[i] == '"') fputs("\\\"", out);
        else if (s[i] == '\\') fputs("\\\\", out);
        else if (s[i] == '\n') fputs("\\n", out);
        else if (s[i] == '\r') fputs("\\r", out);
        else if (s[i] == '\t') fputs("\\t", out);
        else fputc(s[i], out);
    }
}

void print_assembly_json(FILE *out, CodeGenContext *ctx) {
    if (!ctx) {
        fputs("[]", out);
        return;
    }
    
    fputs("[", out);
    AsmInstr *curr = ctx->head;
    int first = 1;
    while (curr) {
        if (!first) fputc(',', out);
        fputs("{\"code\":\"", out);
        escape_json_str(out, curr->text);
        fputs("\",\"comment\":\"", out);
        escape_json_str(out, curr->comment);
        fputs("\"}", out);
        first = 0;
        curr = curr->next;
    }
    fputs("]", out);
}
