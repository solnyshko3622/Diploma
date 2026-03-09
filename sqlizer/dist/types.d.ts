export interface SQLToken {
    type: 'keyword' | 'identifier' | 'string' | 'number' | 'operator' | 'punctuation' | 'comment' | 'unknown';
    value: string;
    start: number;
    end: number;
    line: number;
    column: number;
}
export interface SQLError {
    message: string;
    start: number;
    end: number;
    line: number;
    column: number;
    severity: 'error' | 'warning';
}
export interface SQLParseResult {
    tokens: SQLToken[];
    errors: SQLError[];
    isValid: boolean;
}
export interface MonacoError {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    severity: number;
}
