import { SQLParser } from './parser.js';
import { MonacoSQLValidator, registerSQLValidation } from './monaco-integration.js';
export { SQLParser, MonacoSQLValidator, registerSQLValidation };
/**
 * Main function to initialize SQL validation for Monaco Editor
 * @param editor - Monaco Editor instance
 * @returns MonacoSQLValidator instance
 */
export function createSQLValidator(editor) {
    return new MonacoSQLValidator(editor);
}
/**
 * Initialize the sqlizer library with Monaco Editor
 * @param monaco - Monaco Editor global object
 */
export function initializeSQLizer(monaco) {
    // Register the library globally
    window.sqlizer = {
        MonacoSQLValidator,
        registerSQLValidation,
        createSQLValidator,
        SQLParser
    };
    // Register SQL language features
    registerSQLValidation(monaco);
}
// Auto-initialize if Monaco is available
if (typeof window !== 'undefined' && window.monaco) {
    initializeSQLizer(window.monaco);
}
