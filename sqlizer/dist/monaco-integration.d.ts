export declare class MonacoSQLValidator {
    private parser;
    private editor;
    private decorationIds;
    private validationTimeout;
    constructor(editor: any);
    validateSQL(sql: string, delay?: number): void;
    private performValidation;
    private convertToMonacoErrors;
    private highlightErrors;
    dispose(): void;
}
export declare function createSQLValidationProvider(): any;
export declare function registerSQLValidation(monaco: any): void;
