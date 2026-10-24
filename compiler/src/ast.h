#ifndef AST_H
#define AST_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef enum {
    NODE_PROGRAM,
    NODE_VAR_DECL,
    NODE_ASSIGN,
    NODE_BINARY_OP,
    NODE_UNARY_OP,
    NODE_IF,
    NODE_WHILE,
    NODE_BLOCK,
    NODE_IDENTIFIER,
    NODE_INT_LITERAL,
    NODE_FLOAT_LITERAL,
    NODE_CHAR_LITERAL
} NodeType;

typedef struct ASTNode {
    NodeType type;
    int line;
    int col;
    
    // Type specific data
    char *data_type;     // e.g. "int", "float", "char"
    char *name;          // identifier name or operator string
    long int_val;        // integer literal
    double float_val;    // float literal
    char char_val;       // char literal
    
    // Child nodes
    struct ASTNode *left;
    struct ASTNode *right;
    struct ASTNode *cond;
    struct ASTNode *body;
    struct ASTNode *else_body;
    
    // Linked list for statements / declarations
    struct ASTNode *next;
} ASTNode;

ASTNode *create_program_node(ASTNode *statements);
ASTNode *create_var_decl_node(const char *type, const char *name, ASTNode *init_expr, int line, int col);
ASTNode *create_assign_node(const char *name, ASTNode *expr, int line, int col);
ASTNode *create_binary_op_node(const char *op, ASTNode *left, ASTNode *right, int line, int col);
ASTNode *create_unary_op_node(const char *op, ASTNode *expr, int line, int col);
ASTNode *create_if_node(ASTNode *cond, ASTNode *body, ASTNode *else_body, int line, int col);
ASTNode *create_while_node(ASTNode *cond, ASTNode *body, int line, int col);
ASTNode *create_block_node(ASTNode *statements, int line, int col);
ASTNode *create_identifier_node(const char *name, int line, int col);
ASTNode *create_int_literal_node(long val, int line, int col);
ASTNode *create_float_literal_node(double val, int line, int col);
ASTNode *create_char_literal_node(char val, int line, int col);

ASTNode *append_statement(ASTNode *head, ASTNode *item);
void free_ast(ASTNode *node);
void print_ast_json(FILE *out, ASTNode *node);

#endif // AST_H
