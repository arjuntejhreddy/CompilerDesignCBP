#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ast.h"
#include "tac.h"
#include "codegen.h"
#include "cfg.h"

extern int yyparse();
extern FILE *yyin;
extern ASTNode *root_ast;

typedef struct TokenItem {
    char *type;
    char *lexeme;
    int line;
    int col;
    struct TokenItem *next;
} TokenItem;

extern TokenItem *token_stream_head;
extern void free_tokens();

typedef struct ErrorNode {
    char *message;
    int line;
    int col;
    struct ErrorNode *next;
} ErrorNode;

extern ErrorNode *error_list;

typedef struct SymbolItem {
    char *name;
    char *type;
    int line;
    struct SymbolItem *next;
} SymbolItem;

static SymbolItem *symbol_table = NULL;

static void add_symbol(const char *name, const char *type, int line) {
    SymbolItem *curr = symbol_table;
    while (curr) {
        if (strcmp(curr->name, name) == 0) return;
        curr = curr->next;
    }
    SymbolItem *sym = (SymbolItem *)calloc(1, sizeof(SymbolItem));
    sym->name = strdup(name);
    sym->type = strdup(type ? type : "unknown");
    sym->line = line;
    sym->next = symbol_table;
    symbol_table = sym;
}

static void extract_symbols(ASTNode *node) {
    if (!node) return;
    if (node->type == NODE_VAR_DECL) {
        add_symbol(node->name, node->data_type, node->line);
    }
    extract_symbols(node->left);
    extract_symbols(node->right);
    extract_symbols(node->cond);
    extract_symbols(node->body);
    extract_symbols(node->else_body);
    extract_symbols(node->next);
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

int main(int argc, char **argv) {
    if (argc > 1) {
        yyin = fopen(argv[1], "r");
        if (!yyin) {
            fprintf(stderr, "Failed to open input file: %s\n", argv[1]);
            return 1;
        }
    } else {
        yyin = stdin;
    }

    int parse_status = yyparse();

    // Start JSON output
    fputs("{\n", stdout);
    fprintf(stdout, "  \"success\": %s,\n", (parse_status == 0 && error_list == NULL) ? "true" : "false");
    fprintf(stdout, "  \"parseStatus\": %d,\n", parse_status);

    // 1. Errors
    fputs("  \"errors\": [", stdout);
    ErrorNode *err = error_list;
    int first_err = 1;
    while (err) {
        if (!first_err) fputc(',', stdout);
        fputs("{\"message\":\"", stdout);
        escape_json_str(stdout, err->message);
        fprintf(stdout, "\",\"line\":%d,\"col\":%d}", err->line, err->col);
        first_err = 0;
        err = err->next;
    }
    fputs("],\n", stdout);

    // 2. Tokens
    fputs("  \"tokens\": [", stdout);
    TokenItem *tok = token_stream_head;
    int first_tok = 1;
    while (tok) {
        if (!first_tok) fputc(',', stdout);
        fprintf(stdout, "{\"type\":\"%s\",\"lexeme\":\"", tok->type);
        escape_json_str(stdout, tok->lexeme);
        fprintf(stdout, "\",\"line\":%d,\"col\":%d}", tok->line, tok->col);
        first_tok = 0;
        tok = tok->next;
    }
    fputs("],\n", stdout);

    // 3. AST
    fputs("  \"ast\": ", stdout);
    if (root_ast) {
        print_ast_json(stdout, root_ast);
    } else {
        fputs("null", stdout);
    }
    fputs(",\n", stdout);

    // 4. Symbol Table
    extract_symbols(root_ast);
    fputs("  \"symbolTable\": [", stdout);
    SymbolItem *sym = symbol_table;
    int first_sym = 1;
    while (sym) {
        if (!first_sym) fputc(',', stdout);
        fprintf(stdout, "{\"name\":\"%s\",\"type\":\"%s\",\"line\":%d}", sym->name, sym->type, sym->line);
        first_sym = 0;
        sym = sym->next;
    }
    fputs("],\n", stdout);

    // 5. TAC & Quadruples
    TACContext *tac_ctx = create_tac_context();
    if (root_ast) {
        generate_program_tac(tac_ctx, root_ast);
    }
    fputs("  \"tac\": ", stdout);
    print_tac_json(stdout, tac_ctx);
    fputs(",\n", stdout);

    // 6. Target Pseudo-Assembly
    CodeGenContext *asm_ctx = create_codegen_context();
    if (tac_ctx) {
        generate_assembly(asm_ctx, tac_ctx);
    }
    fputs("  \"assembly\": ", stdout);
    print_assembly_json(stdout, asm_ctx);
    fputs(",\n", stdout);

    // 7. CFG & Flowchart
    CFGContext *cfg_ctx = create_cfg_context();
    if (root_ast) {
        build_cfg_from_ast(cfg_ctx, root_ast);
    }
    fputs("  \"flowchart\": ", stdout);
    print_cfg_json(stdout, cfg_ctx);
    fputs("\n}\n", stdout);

    // Cleanup
    free_tac_context(tac_ctx);
    free_codegen_context(asm_ctx);
    free_cfg_context(cfg_ctx);
    free_ast(root_ast);
    free_tokens();

    if (yyin && yyin != stdin) {
        fclose(yyin);
    }

    return 0;
}
