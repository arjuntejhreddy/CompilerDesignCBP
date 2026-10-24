#ifndef CFG_H
#define CFG_H

#include "ast.h"

typedef enum {
    CFG_NODE_START,
    CFG_NODE_END,
    CFG_NODE_PROCESS,
    CFG_NODE_DECISION,
    CFG_NODE_CONNECTOR
} CFGNodeType;

typedef struct CFGEdge {
    int target_id;
    char *label; // "true", "false", or ""
    struct CFGEdge *next;
} CFGEdge;

typedef struct CFGNode {
    int id;
    CFGNodeType type;
    char *label;
    char *code;
    CFGEdge *edges;
    struct CFGNode *next;
} CFGNode;

typedef struct CFGContext {
    int node_counter;
    CFGNode *head;
    CFGNode *tail;
    int entry_id;
    int exit_id;
} CFGContext;

CFGContext *create_cfg_context();
void free_cfg_context(CFGContext *ctx);

CFGNode *add_cfg_node(CFGContext *ctx, CFGNodeType type, const char *label, const char *code);
void add_cfg_edge(CFGContext *ctx, int src_id, int dst_id, const char *label);

void build_cfg_from_ast(CFGContext *ctx, ASTNode *program);
void print_cfg_json(FILE *out, CFGContext *ctx);

#endif // CFG_H
