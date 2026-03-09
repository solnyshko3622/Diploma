import { SQLParseResult } from './types.js';
export declare class SQLParser {
    private static readonly SQL_KEYWORDS;
    private static readonly OPERATORS;
    private static readonly PUNCTUATION;
    parse(sql: string): SQLParseResult;
    private isWhitespace;
    private isDigit;
    private isOperator;
    private isPunctuation;
    private isIdentifierStart;
    private isIdentifierChar;
    private parseComment;
    private parseString;
    private parseNumber;
    private parseOperator;
    private parseIdentifier;
    private validateSyntax;
    private validateClauseOrder;
}
