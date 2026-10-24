#include "ast.h"

static char *safe_strdup(const char *s) {
    if (!s) return NULL;
    char *res = (char *)malloc(strlen(s) + 1);
    if (res) strcpy(res, s);
    return res;
}

static ASTNode *alloc_node(NodeType type, int line, int col) {
    ASTNode *node = (ASTNode *)calloc(1, sizeof(ASTNode));
    if (!node) {
        fprintf(stderr, "Fatal error: Out of memory\n");
        exit(1);
    }
    node->type = type;
    node->line = line;
    node->col = col;
    return node;
}

ASTNode *create_program_node(ASTNode *statements) {
    ASTNode *node = alloc_node(NODE_PROGRAM, 1, 1);
    node->body = statements;
    return node;
}

ASTNode *create_var_decl_node(const char *type, const char *name, ASTNode *init_expr, int line, int col) {
    ASTNode *node = alloc_node(NODE_VAR_DECL, line, col);
    node->data_type = safe_strdup(type);
    node->name = safe_strdup(name);
    node->right = init_expr;
    return node;
}

ASTNode *create_assign_node(const char *name, ASTNode *expr, int line, int col) {
    ASTNode *node = alloc_node(NODE_ASSIGN, line, col);
    node->name = safe_strdup(name);
    node->right = expr;
    return node;
}

ASTNode *create_binary_op_node(const char *op, ASTNode *left, ASTNode *right, int line, int col) {
    ASTNode *node = alloc_node(NODE_BINARY_OP, line, col);
    node->name = safe_strdup(op);
    node->left = left;
    node->right = right;
    return node;
}

ASTNode *create_unary_op_node(const char *op, ASTNode *expr, int line, int col) {
    ASTNode *node = alloc_node(NODE_UNARY_OP, line, col);
    node->name = safe_strdup(op);
    node->left = expr;
    return node;
}

ASTNode *create_if_node(ASTNode *cond, ASTNode *body, ASTNode *else_body, int line, int col) {
    ASTNode *node = alloc_node(NODE_IF, line, col);
    node->cond = cond;
    node->body = body;
    node->else_body = else_body;
    return node;
}

ASTNode *create_while_node(ASTNode *cond, ASTNode *body, int line, int col) {
    ASTNode *node = alloc_node(NODE_WHILE, line, col);
    node->cond = cond;
    node->body = body;
    return node;
}

ASTNode *create_block_node(ASTNode *statements, int line, int col) {
    ASTNode *node = alloc_node(NODE_BLOCK, line, col);
    node->body = statements;
    return node;
}

ASTNode *create_identifier_node(const char *name, int line, int col) {
    ASTNode *node = alloc_node(NODE_IDENTIFIER, line, col);
    node->name = safe_strdup(name);
    return node;
}

ASTNode *create_int_literal_node(long val, int line, int col) {
    ASTNode *node = alloc_node(NODE_INT_LITERAL, line, col);
    node->int_val = val;
    return node;
}

ASTNode *create_float_literal_node(double val, int line, int col) {
    ASTNode *node = alloc_node(NODE_FLOAT_LITERAL, line, col);
    node->float_val = val;
    return node;
}

ASTNode *create_char_literal_node(char val, int line, int col) {
    ASTNode *node = alloc_node(NODE_CHAR_LITERAL, line, col);
    node->char_val = val;
    return node;
}

ASTNode *append_statement(ASTNode *head, ASTNode *item) {
    if (!head) return item;
    if (!item) return head;
    ASTNode *curr = head;
    while (curr->next) {
        curr = curr->next;
    }
    curr->next = item;
    return head;
}

void free_ast(ASTNode *node) {
    if (!node) return;
    if (node->data_type) free(node->data_type);
    if (node->name) free(node->name);
    free_ast(node->left);
    free_ast(node->right);
    free_ast(node->cond);
    free_ast(node->body);
    free_ast(node->else_body);
    free_ast(node->next);
    free(node);
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

void print_ast_json(FILE *out, ASTNode *node) {
    if (!node) {
        fputs("null", out);
        return;
    }
    
    fputs("{", out);
    fprintf(out, "\"line\":%d,\"col\":%d,", node->line, node->col);
    
    switch (node->type) {
        case NODE_PROGRAM:
            fputs("\"nodeType\":\"Program\",\"body\":[", out);
            {
                ASTNode *curr = node->body;
                int first = 1;
                while (curr) {
                    if (!first) fputc(',', out);
                    print_ast_json(out, curr);
                    first = 0;
                    curr = curr->next;
                }
            }
            fputs("]", out);
            break;
            
        case NODE_VAR_DECL:
            fputs("\"nodeType\":\"VarDeclaration\",", out);
            fprintf(out, "\"dataType\":\"%s\",\"name\":\"", node->data_type ? node->data_type : "");
            escape_json_str(out, node->name);
            fputs("\",\"init\":", out);
            print_ast_json(out, node->right);
            break;
            
        case NODE_ASSIGN:
            fputs("\"nodeType\":\"Assignment\",", out);
            fputs("\"name\":\"", out);
            escape_json_str(out, node->name);
            fputs("\",\"expr\":", out);
            print_ast_json(out, node->right);
            break;
            
        case NODE_BINARY_OP:
            fputs("\"nodeType\":\"BinaryExpr\",", out);
            fputs("\"op\":\"", out);
            escape_json_str(out, node->name);
            fputs("\",\"left\":", out);
            print_ast_json(out, node->left);
            fputs(",\"right\":", out);
            print_ast_json(out, node->right);
            break;
            
        case NODE_UNARY_OP:
            fputs("\"nodeType\":\"UnaryExpr\",", out);
            fputs("\"op\":\"", out);
            escape_json_str(out, node->name);
            fputs("\",\"operand\":", out);
            print_ast_json(out, node->left);
            break;
            
        case NODE_IF:
            fputs("\"nodeType\":\"IfStatement\",", out);
            fputs("\"condition\":", out);
            print_ast_json(out, node->cond);
            fputs(",\"thenBranch\":", out);
            print_ast_json(out, node->body);
            fputs(",\"elseBranch\":", out);
            print_ast_json(out, node->else_body);
            break;
            
        case NODE_WHILE:
            fputs("\"nodeType\":\"WhileStatement\",", out);
            fputs("\"condition\":", out);
            print_ast_json(out, node->cond);
            fputs(",\"body\":", out);
            print_ast_json(out, node->body);
            break;
            
        case NODE_BLOCK:
            fputs("\"nodeType\":\"Block\",", out);
            fputs("\"statements\":[", out);
            {
                ASTNode *curr = node->body;
                int first = 1;
                while (curr) {
                    if (!first) fputc(',', out);
                    print_ast_json(out, curr);
                    first = 0;
                    curr = curr->next;
                }
            }
            fputs("]", out);
            break;
            
        case NODE_IDENTIFIER:
            fputs("\"nodeType\":\"Identifier\",\"name\":\"", out);
            escape_json_str(out, node->name);
            fputc('"', out);
            break;
            
        case NODE_INT_LITERAL:
            fprintf(out, "\"nodeType\":\"IntegerLiteral\",\"value\":%ld", node->int_val);
            break;
            
        case NODE_FLOAT_LITERAL:
            fprintf(out, "\"nodeType\":\"FloatLiteral\",\"value\":%f", node->float_val);
            break;
            
        case NODE_CHAR_LITERAL:
            fprintf(out, "\"nodeType\":\"CharLiteral\",\"value\":\"%c\"", node->char_val);
            break;
    }
    
    fputc('}', out);
}
