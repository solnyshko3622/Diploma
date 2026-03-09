/**
 * SQL Lexer definition for syntax-parser
 */
export declare const SQLLexer: import("syntax-parser").Lexer;
export declare const SQLSyntaxParser: (text: string, cursorIndex?: number) => import("syntax-parser").IParseResult;
export interface SyntaxParserError {
    message: string;
    severity: 'error' | 'warning';
    token: any;
    line?: number;
    column?: number;
}
export interface SyntaxParserResult {
    ast: any;
    errors: SyntaxParserError[];
    isValid: boolean;
}
/**
 * Parse SQL using syntax-parser with enhanced error reporting
 */
export declare function parseSQLWithSyntaxParser(sql: string): SyntaxParserResult;
