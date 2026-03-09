import { SQLParser } from './parser.js';
import { MonacoSQLValidator, registerSQLValidation } from './monaco-integration.js';
export type { SQLToken, SQLError, SQLParseResult, MonacoError } from './types.js';
export { SQLParser, MonacoSQLValidator, registerSQLValidation };
/**
 * Main function to initialize SQL validation for Monaco Editor
 * @param editor - Monaco Editor instance
 * @returns MonacoSQLValidator instance
 */
export declare function createSQLValidator(editor: any): any;
/**
 * Initialize the sqlizer library with Monaco Editor
 * @param monaco - Monaco Editor global object
 */
export declare function initializeSQLizer(monaco: any): void;
