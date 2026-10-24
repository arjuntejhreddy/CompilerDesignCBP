#include "tac.h"

static char *safe_strdup(const char *s) {
    if (!s) return NULL;
    char *res = (char *)malloc(strlen(s) + 1);
    if (res) strcpy(res, s);
    return res;
}

TACContext *create_tac_context() {
    TACContext *ctx = (TACContext *)calloc(1, sizeof(TACContext));
    ctx->temp_counter = 0;
    ctx->label_counter = 0;
    return ctx;
}

void free_tac_context(TACContext *ctx) {
    if (!ctx) return;
    TACInstr *curr = ctx->head;
    while (curr) {
        TACInstr *next = curr->next;
        if (curr->op) free(curr->op);
        if (curr->arg1) free(curr->arg1);
        if (curr->arg2) free(curr->arg2);
        if (curr->result) free(curr->result);
        free(curr);
        curr = next;
    }
    free(ctx);
}

char *new_temp(TACContext *ctx) {
    char buf[32];
    snprintf(buf, sizeof(buf), "t%d", ctx->temp_counter++);
    return safe_strdup(buf);
}

char *new_label(TACContext *ctx) {
    char buf[32];
    snprintf(buf, sizeof(buf), "L%d", ctx->label_counter++);
    return safe_strdup(buf);
}

void emit_tac(TACContext *ctx, const char *op, const char *arg1, const char *arg2, const char *result) {
    TACInstr *instr = (TACInstr *)calloc(1, sizeof(TACInstr));
    instr->op = safe_strdup(op);
    instr->arg1 = safe_strdup(arg1);
    instr->arg2 = safe_strdup(arg2);
    instr->result = safe_strdup(result);
    
    if (!ctx->head) {
        ctx->head = instr;
        ctx->tail = instr;
    } else {
        ctx->tail->next = instr;
        ctx->tail = instr;
    }
}

char *generate_ast_tac(TACContext *ctx, ASTNode *node) {
    if (!node) return NULL;
    char buf[64];
    
    switch (node->type) {
        case NODE_INT_LITERAL:
            snprintf(buf, sizeof(buf), "%ld", node->int_val);
            return safe_strdup(buf);
            
        case NODE_FLOAT_LITERAL:
            snprintf(buf, sizeof(buf), "%g", node->float_val);
            return safe_strdup(buf);
            
        case NODE_CHAR_LITERAL:
            snprintf(buf, sizeof(buf), "'%c'", node->char_val);
            return safe_strdup(buf);
            
        case NODE_IDENTIFIER:
            return safe_strdup(node->name);
            
        case NODE_BINARY_OP: {
            char *left = generate_ast_tac(ctx, node->left);
            char *right = generate_ast_tac(ctx, node->right);
            char *t = new_temp(ctx);
            emit_tac(ctx, node->name, left, right, t);
            if (left) free(left);
            if (right) free(right);
            return t;
        }
        
        case NODE_UNARY_OP: {
            char *operand = generate_ast_tac(ctx, node->left);
            char *t = new_temp(ctx);
            emit_tac(ctx, node->name, operand, NULL, t);
            if (operand) free(operand);
            return t;
        }
        
        case NODE_VAR_DECL: {
            if (node->right) {
                char *val = generate_ast_tac(ctx, node->right);
                emit_tac(ctx, "=", val, NULL, node->name);
                if (val) free(val);
            }
            return NULL;
        }
        
        case NODE_ASSIGN: {
            char *val = generate_ast_tac(ctx, node->right);
            emit_tac(ctx, "=", val, NULL, node->name);
            if (val) free(val);
            return NULL;
        }
        
        case NODE_IF: {
            char *cond = generate_ast_tac(ctx, node->cond);
            char *lbl_else = new_label(ctx);
            char *lbl_end = new_label(ctx);
            
            emit_tac(ctx, "if_false", cond, NULL, node->else_body ? lbl_else : lbl_end);
            if (cond) free(cond);
            
            // Generate then body
            generate_ast_tac(ctx, node->body);
            
            if (node->else_body) {
                emit_tac(ctx, "goto", NULL, NULL, lbl_end);
                emit_tac(ctx, "label", NULL, NULL, lbl_else);
                generate_ast_tac(ctx, node->else_body);
            }
            
            emit_tac(ctx, "label", NULL, NULL, lbl_end);
            free(lbl_else);
            free(lbl_end);
            return NULL;
        }
        
        case NODE_WHILE: {
            char *lbl_start = new_label(ctx);
            char *lbl_end = new_label(ctx);
            
            emit_tac(ctx, "label", NULL, NULL, lbl_start);
            char *cond = generate_ast_tac(ctx, node->cond);
            emit_tac(ctx, "if_false", cond, NULL, lbl_end);
            if (cond) free(cond);
            
            generate_ast_tac(ctx, node->body);
            emit_tac(ctx, "goto", NULL, NULL, lbl_start);
            emit_tac(ctx, "label", NULL, NULL, lbl_end);
            
            free(lbl_start);
            free(lbl_end);
            return NULL;
        }
        
        case NODE_BLOCK:
        case NODE_PROGRAM: {
            ASTNode *curr = node->body;
            while (curr) {
                char *res = generate_ast_tac(ctx, curr);
                if (res) free(res);
                curr = curr->next;
            }
            return NULL;
        }
        
        default:
            return NULL;
    }
}

void generate_program_tac(TACContext *ctx, ASTNode *program) {
    if (!program) return;
    generate_ast_tac(ctx, program);
}

void print_tac_json(FILE *out, TACContext *ctx) {
    if (!ctx) {
        fputs("{\"lines\":[],\"quadruples\":[]}", out);
        return;
    }
    
    fputs("{\"lines\":[", out);
    TACInstr *curr = ctx->head;
    int first = 1;
    while (curr) {
        if (!first) fputc(',', out);
        fputc('"', out);
        
        if (strcmp(curr->op, "label") == 0) {
            fprintf(out, "%s:", curr->result ? curr->result : "");
        } else if (strcmp(curr->op, "goto") == 0) {
            fprintf(out, "goto %s", curr->result ? curr->result : "");
        } else if (strcmp(curr->op, "if_false") == 0) {
            fprintf(out, "if_false %s goto %s", curr->arg1 ? curr->arg1 : "", curr->result ? curr->result : "");
        } else if (strcmp(curr->op, "if_true") == 0) {
            fprintf(out, "if_true %s goto %s", curr->arg1 ? curr->arg1 : "", curr->result ? curr->result : "");
        } else if (strcmp(curr->op, "=") == 0) {
            fprintf(out, "%s = %s", curr->result ? curr->result : "", curr->arg1 ? curr->arg1 : "");
        } else if (curr->arg2) {
            fprintf(out, "%s = %s %s %s", curr->result ? curr->result : "", curr->arg1 ? curr->arg1 : "", curr->op, curr->arg2 ? curr->arg2 : "");
        } else {
            fprintf(out, "%s = %s %s", curr->result ? curr->result : "", curr->op, curr->arg1 ? curr->arg1 : "");
        }
        
        fputc('"', out);
        first = 0;
        curr = curr->next;
    }
    fputs("],\"quadruples\":[", out);
    
    curr = ctx->head;
    first = 1;
    int idx = 0;
    while (curr) {
        if (!first) fputc(',', out);
        fprintf(out, "{\"index\":%d,\"op\":\"%s\",\"arg1\":%s%s%s,\"arg2\":%s%s%s,\"result\":%s%s%s}",
            idx++,
            curr->op ? curr->op : "",
            curr->arg1 ? "\"" : "", curr->arg1 ? curr->arg1 : "null", curr->arg1 ? "\"" : "",
            curr->arg2 ? "\"" : "", curr->arg2 ? curr->arg2 : "null", curr->arg2 ? "\"" : "",
            curr->result ? "\"" : "", curr->result ? curr->result : "null", curr->result ? "\"" : "");
        first = 0;
        curr = curr->next;
    }
    fputs("]}", out);
}
