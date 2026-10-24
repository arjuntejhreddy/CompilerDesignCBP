#include "cfg.h"

static char *safe_strdup(const char *s) {
    if (!s) return NULL;
    char *res = (char *)malloc(strlen(s) + 1);
    if (res) strcpy(res, s);
    return res;
}

CFGContext *create_cfg_context() {
    CFGContext *ctx = (CFGContext *)calloc(1, sizeof(CFGContext));
    ctx->node_counter = 0;
    return ctx;
}

void free_cfg_context(CFGContext *ctx) {
    if (!ctx) return;
    CFGNode *curr = ctx->head;
    while (curr) {
        CFGNode *next = curr->next;
        if (curr->label) free(curr->label);
        if (curr->code) free(curr->code);
        CFGEdge *edge = curr->edges;
        while (edge) {
            CFGEdge *next_edge = edge->next;
            if (edge->label) free(edge->label);
            free(edge);
            edge = next_edge;
        }
        free(curr);
        curr = next;
    }
    free(ctx);
}

CFGNode *add_cfg_node(CFGContext *ctx, CFGNodeType type, const char *label, const char *code) {
    CFGNode *node = (CFGNode *)calloc(1, sizeof(CFGNode));
    node->id = ctx->node_counter++;
    node->type = type;
    node->label = safe_strdup(label);
    node->code = safe_strdup(code);
    
    if (!ctx->head) {
        ctx->head = node;
        ctx->tail = node;
    } else {
        ctx->tail->next = node;
        ctx->tail = node;
    }
    return node;
}

void add_cfg_edge(CFGContext *ctx, int src_id, int dst_id, const char *label) {
    CFGNode *curr = ctx->head;
    while (curr && curr->id != src_id) {
        curr = curr->next;
    }
    if (!curr) return;
    
    CFGEdge *edge = (CFGEdge *)calloc(1, sizeof(CFGEdge));
    edge->target_id = dst_id;
    edge->label = safe_strdup(label);
    
    if (!curr->edges) {
        curr->edges = edge;
    } else {
        CFGEdge *e = curr->edges;
        while (e->next) {
            e = e->next;
        }
        e->next = edge;
    }
}

static char *ast_expr_to_str(ASTNode *node) {
    if (!node) return safe_strdup("");
    char buf[256];
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
            char *l = ast_expr_to_str(node->left);
            char *r = ast_expr_to_str(node->right);
            snprintf(buf, sizeof(buf), "%s %s %s", l, node->name, r);
            free(l);
            free(r);
            return safe_strdup(buf);
        }
        case NODE_UNARY_OP: {
            char *l = ast_expr_to_str(node->left);
            snprintf(buf, sizeof(buf), "%s%s", node->name, l);
            free(l);
            return safe_strdup(buf);
        }
        default:
            return safe_strdup("expr");
    }
}

// Forward declarations
static int build_cfg_subgraph(CFGContext *ctx, ASTNode *stmt, int incoming_id);

static int build_cfg_subgraph(CFGContext *ctx, ASTNode *stmt, int incoming_id) {
    if (!stmt) return incoming_id;
    
    int current_in = incoming_id;
    
    switch (stmt->type) {
        case NODE_VAR_DECL: {
            char code_str[256];
            char *init_s = stmt->right ? ast_expr_to_str(stmt->right) : NULL;
            if (init_s) {
                snprintf(code_str, sizeof(code_str), "%s %s = %s;", stmt->data_type, stmt->name, init_s);
                free(init_s);
            } else {
                snprintf(code_str, sizeof(code_str), "%s %s;", stmt->data_type, stmt->name);
            }
            CFGNode *n = add_cfg_node(ctx, CFG_NODE_PROCESS, "Declaration", code_str);
            if (current_in >= 0) add_cfg_edge(ctx, current_in, n->id, "");
            return n->id;
        }
        
        case NODE_ASSIGN: {
            char code_str[256];
            char *expr_s = ast_expr_to_str(stmt->right);
            snprintf(code_str, sizeof(code_str), "%s = %s;", stmt->name, expr_s);
            free(expr_s);
            CFGNode *n = add_cfg_node(ctx, CFG_NODE_PROCESS, "Assignment", code_str);
            if (current_in >= 0) add_cfg_edge(ctx, current_in, n->id, "");
            return n->id;
        }
        
        case NODE_IF: {
            char *cond_s = ast_expr_to_str(stmt->cond);
            char code_str[256];
            snprintf(code_str, sizeof(code_str), "if (%s)", cond_s);
            free(cond_s);
            
            CFGNode *decision = add_cfg_node(ctx, CFG_NODE_DECISION, "Condition", code_str);
            if (current_in >= 0) add_cfg_edge(ctx, current_in, decision->id, "");
            
            // Build true branch
            int true_end = decision->id;
            if (stmt->body) {
                // If the body is a block, process its statements
                if (stmt->body->type == NODE_BLOCK || stmt->body->type == NODE_PROGRAM) {
                    ASTNode *s = stmt->body->body;
                    int prev = -1;
                    while (s) {
                        if (prev == -1) {
                            // first node in branch connects from decision with "true"
                            CFGNode *first_proc = NULL;
                            char *s_expr = NULL;
                            char s_buf[256];
                            if (s->type == NODE_ASSIGN) {
                                s_expr = ast_expr_to_str(s->right);
                                snprintf(s_buf, sizeof(s_buf), "%s = %s;", s->name, s_expr);
                                free(s_expr);
                                first_proc = add_cfg_node(ctx, CFG_NODE_PROCESS, "Assignment", s_buf);
                            } else if (s->type == NODE_VAR_DECL) {
                                s_expr = s->right ? ast_expr_to_str(s->right) : NULL;
                                if (s_expr) {
                                    snprintf(s_buf, sizeof(s_buf), "%s %s = %s;", s->data_type, s->name, s_expr);
                                    free(s_expr);
                                } else {
                                    snprintf(s_buf, sizeof(s_buf), "%s %s;", s->data_type, s->name);
                                }
                                first_proc = add_cfg_node(ctx, CFG_NODE_PROCESS, "Declaration", s_buf);
                            } else {
                                first_proc = add_cfg_node(ctx, CFG_NODE_PROCESS, "Statement", "statement");
                            }
                            add_cfg_edge(ctx, decision->id, first_proc->id, "true");
                            prev = first_proc->id;
                        } else {
                            prev = build_cfg_subgraph(ctx, s, prev);
                        }
                        s = s->next;
                    }
                    true_end = prev != -1 ? prev : decision->id;
                } else {
                    int n_id = build_cfg_subgraph(ctx, stmt->body, -1);
                    add_cfg_edge(ctx, decision->id, n_id, "true");
                    true_end = n_id;
                }
            }
            
            // Build false branch
            int false_end = decision->id;
            if (stmt->else_body) {
                if (stmt->else_body->type == NODE_BLOCK || stmt->else_body->type == NODE_PROGRAM) {
                    ASTNode *s = stmt->else_body->body;
                    int prev = -1;
                    while (s) {
                        if (prev == -1) {
                            CFGNode *first_proc = NULL;
                            char *s_expr = NULL;
                            char s_buf[256];
                            if (s->type == NODE_ASSIGN) {
                                s_expr = ast_expr_to_str(s->right);
                                snprintf(s_buf, sizeof(s_buf), "%s = %s;", s->name, s_expr);
                                free(s_expr);
                                first_proc = add_cfg_node(ctx, CFG_NODE_PROCESS, "Assignment", s_buf);
                            } else {
                                first_proc = add_cfg_node(ctx, CFG_NODE_PROCESS, "Statement", "statement");
                            }
                            add_cfg_edge(ctx, decision->id, first_proc->id, "false");
                            prev = first_proc->id;
                        } else {
                            prev = build_cfg_subgraph(ctx, s, prev);
                        }
                        s = s->next;
                    }
                    false_end = prev != -1 ? prev : decision->id;
                } else {
                    int n_id = build_cfg_subgraph(ctx, stmt->else_body, -1);
                    add_cfg_edge(ctx, decision->id, n_id, "false");
                    false_end = n_id;
                }
            }
            
            // Create merge connector node
            CFGNode *merge = add_cfg_node(ctx, CFG_NODE_CONNECTOR, "Merge", "");
            if (true_end >= 0) add_cfg_edge(ctx, true_end, merge->id, "");
            if (stmt->else_body) {
                if (false_end >= 0) add_cfg_edge(ctx, false_end, merge->id, "");
            } else {
                add_cfg_edge(ctx, decision->id, merge->id, "false");
            }
            return merge->id;
        }
        
        case NODE_WHILE: {
            char *cond_s = ast_expr_to_str(stmt->cond);
            char code_str[256];
            snprintf(code_str, sizeof(code_str), "while (%s)", cond_s);
            free(cond_s);
            
            CFGNode *loop_header = add_cfg_node(ctx, CFG_NODE_DECISION, "Loop Condition", code_str);
            if (current_in >= 0) add_cfg_edge(ctx, current_in, loop_header->id, "");
            
            // Loop body
            int body_end = loop_header->id;
            if (stmt->body) {
                if (stmt->body->type == NODE_BLOCK || stmt->body->type == NODE_PROGRAM) {
                    ASTNode *s = stmt->body->body;
                    int prev = -1;
                    while (s) {
                        if (prev == -1) {
                            CFGNode *first_proc = NULL;
                            char *s_expr = NULL;
                            char s_buf[256];
                            if (s->type == NODE_ASSIGN) {
                                s_expr = ast_expr_to_str(s->right);
                                snprintf(s_buf, sizeof(s_buf), "%s = %s;", s->name, s_expr);
                                free(s_expr);
                                first_proc = add_cfg_node(ctx, CFG_NODE_PROCESS, "Assignment", s_buf);
                            } else {
                                first_proc = add_cfg_node(ctx, CFG_NODE_PROCESS, "Statement", "statement");
                            }
                            add_cfg_edge(ctx, loop_header->id, first_proc->id, "true");
                            prev = first_proc->id;
                        } else {
                            prev = build_cfg_subgraph(ctx, s, prev);
                        }
                        s = s->next;
                    }
                    body_end = prev != -1 ? prev : loop_header->id;
                } else {
                    int b_id = build_cfg_subgraph(ctx, stmt->body, -1);
                    add_cfg_edge(ctx, loop_header->id, b_id, "true");
                    body_end = b_id;
                }
            }
            // Loop back edge!
            if (body_end >= 0) add_cfg_edge(ctx, body_end, loop_header->id, "loop_back");
            
            // Exit connector
            CFGNode *loop_exit = add_cfg_node(ctx, CFG_NODE_CONNECTOR, "Loop Exit", "");
            add_cfg_edge(ctx, loop_header->id, loop_exit->id, "false");
            return loop_exit->id;
        }
        
        case NODE_BLOCK:
        case NODE_PROGRAM: {
            ASTNode *curr = stmt->body;
            while (curr) {
                current_in = build_cfg_subgraph(ctx, curr, current_in);
                curr = curr->next;
            }
            return current_in;
        }
        
        default:
            return current_in;
    }
}

void build_cfg_from_ast(CFGContext *ctx, ASTNode *program) {
    if (!ctx || !program) return;
    
    CFGNode *start_node = add_cfg_node(ctx, CFG_NODE_START, "Start", "Start Program");
    ctx->entry_id = start_node->id;
    
    int last_id = start_node->id;
    ASTNode *curr = program->body;
    while (curr) {
        last_id = build_cfg_subgraph(ctx, curr, last_id);
        curr = curr->next;
    }
    
    CFGNode *end_node = add_cfg_node(ctx, CFG_NODE_END, "End", "End Program");
    ctx->exit_id = end_node->id;
    if (last_id >= 0) {
        add_cfg_edge(ctx, last_id, end_node->id, "");
    }
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

void print_cfg_json(FILE *out, CFGContext *ctx) {
    if (!ctx) {
        fputs("{\"nodes\":[],\"edges\":[]}", out);
        return;
    }
    
    fputs("{\"nodes\":[", out);
    CFGNode *curr = ctx->head;
    int first = 1;
    while (curr) {
        if (!first) fputc(',', out);
        const char *shape = "rectangle";
        if (curr->type == CFG_NODE_START || curr->type == CFG_NODE_END) shape = "oval";
        else if (curr->type == CFG_NODE_DECISION) shape = "diamond";
        else if (curr->type == CFG_NODE_CONNECTOR) shape = "circle";
        
        fprintf(out, "{\"id\":\"n%d\",\"label\":\"", curr->id);
        escape_json_str(out, curr->label);
        fputs("\",\"code\":\"", out);
        escape_json_str(out, curr->code);
        fprintf(out, "\",\"type\":\"%s\",\"shape\":\"%s\"}",
            curr->type == CFG_NODE_START ? "start" :
            curr->type == CFG_NODE_END ? "end" :
            curr->type == CFG_NODE_DECISION ? "decision" :
            curr->type == CFG_NODE_CONNECTOR ? "connector" : "process",
            shape);
        first = 0;
        curr = curr->next;
    }
    fputs("],\"edges\":[", out);
    
    curr = ctx->head;
    first = 1;
    int edge_id = 0;
    while (curr) {
        CFGEdge *e = curr->edges;
        while (e) {
            if (!first) fputc(',', out);
            fprintf(out, "{\"id\":\"e%d\",\"source\":\"n%d\",\"target\":\"n%d\",\"label\":\"",
                edge_id++, curr->id, e->target_id);
            escape_json_str(out, e->label);
            fputs("\"}", out);
            first = 0;
            e = e->next;
        }
        curr = curr->next;
    }
    fputs("]}", out);
}
