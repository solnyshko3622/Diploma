import { SQLParser } from './parser.js';
export class MonacoSQLValidator {
    constructor(editor) {
        this.decorationIds = [];
        this.validationTimeout = null;
        this.parser = new SQLParser();
        this.editor = editor;
    }
    validateSQL(sql, delay = 300) {
        // Clear previous timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
        // Debounce validation
        this.validationTimeout = setTimeout(() => {
            this.performValidation(sql);
        }, delay);
    }
    performValidation(sql) {
        console.log('Performing SQL validation for:', sql);
        const parseResult = this.parser.parse(sql);
        console.log('Parse result errors:', parseResult.errors);
        const monacoErrors = this.convertToMonacoErrors(parseResult.errors);
        console.log('Monaco errors:', monacoErrors);
        this.highlightErrors(monacoErrors);
    }
    convertToMonacoErrors(errors) {
        return errors.map(error => ({
            startLineNumber: error.line,
            startColumn: error.column,
            endLineNumber: error.line,
            endColumn: error.column + Math.max(1, error.end - error.start),
            message: error.message,
            severity: error.severity === 'error' ? 8 : 4 // monaco.MarkerSeverity.Error = 8, Warning = 4
        }));
    }
    highlightErrors(errors) {
        // Clear previous decorations
        if (this.decorationIds.length > 0) {
            this.editor.deltaDecorations(this.decorationIds, []);
            this.decorationIds = [];
        }
        if (errors.length === 0) {
            return;
        }
        // Use simple decorations for error highlighting
        const decorations = errors.map(error => ({
            range: new window.monaco.Range(error.startLineNumber, error.startColumn, error.endLineNumber, error.endColumn),
            options: {
                // Use inlineClassName for custom styling
                inlineClassName: error.severity === 8 ? 'sql-error-highlight' : 'sql-warning-highlight',
                hoverMessage: { value: error.message },
                overviewRuler: {
                    color: error.severity === 8 ? '#ff4444' : '#ffaa00',
                    position: window.monaco.editor.OverviewRulerLane.Right
                },
                stickiness: 1 // Tracked by the editor when inserting/deleting text
            }
        }));
        this.decorationIds = this.editor.deltaDecorations([], decorations);
    }
    dispose() {
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
        // Clear all decorations
        if (this.decorationIds.length > 0) {
            this.editor.deltaDecorations(this.decorationIds, []);
            this.decorationIds = [];
        }
        // Clear model markers
        const model = this.editor.getModel();
        if (model) {
            window.monaco.editor.setModelMarkers(model, 'sqlizer', []);
        }
    }
}
export function createSQLValidationProvider() {
    return {
        provideCompletionItems: (model, position) => {
            // Basic SQL keyword completion
            const keywords = [
                'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
                'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'JOIN', 'ON', 'GROUP BY',
                'ORDER BY', 'LIMIT', 'OFFSET', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN'
            ];
            return {
                suggestions: keywords.map(keyword => ({
                    label: keyword,
                    kind: window.monaco.languages.CompletionItemKind.Keyword,
                    insertText: keyword,
                    range: new window.monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
                }))
            };
        },
        provideHover: (model, position) => {
            // Basic hover information for SQL keywords
            const word = model.getWordAtPosition(position);
            if (word) {
                const keyword = word.word.toUpperCase();
                const descriptions = {
                    'SELECT': 'Retrieves data from a database',
                    'FROM': 'Specifies the table to select from',
                    'WHERE': 'Filters the result set',
                    'INSERT': 'Inserts new data into a table',
                    'UPDATE': 'Modifies existing data in a table',
                    'DELETE': 'Deletes data from a table',
                    'CREATE': 'Creates a new database object',
                    'TABLE': 'Creates a new table',
                    'DROP': 'Deletes a database object'
                };
                if (descriptions[keyword]) {
                    return {
                        range: new window.monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
                        contents: [
                            { value: `**${keyword}**` },
                            { value: descriptions[keyword] }
                        ]
                    };
                }
            }
            return null;
        }
    };
}
export function registerSQLValidation(monaco) {
    // Register SQL language configuration
    monaco.languages.register({ id: 'sql' });
    // Register completion item provider
    monaco.languages.registerCompletionItemProvider('sql', createSQLValidationProvider());
    // Configure SQL language
    monaco.languages.setLanguageConfiguration('sql', {
        comments: {
            lineComment: '--',
            blockComment: ['/*', '*/']
        },
        brackets: [
            ['(', ')'],
            ['[', ']'],
            ['{', '}']
        ],
        autoClosingPairs: [
            { open: '(', close: ')' },
            { open: '[', close: ']' },
            { open: '{', close: '}' },
            { open: "'", close: "'" },
            { open: '"', close: '"' }
        ],
        surroundingPairs: [
            { open: '(', close: ')' },
            { open: '[', close: ']' },
            { open: '{', close: '}' },
            { open: "'", close: "'" },
            { open: '"', close: '"' }
        ]
    });
    // Set SQL tokenization rules
    monaco.languages.setMonarchTokensProvider('sql', {
        defaultToken: '',
        tokenPostfix: '.sql',
        keywords: [
            'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set',
            'delete', 'create', 'table', 'drop', 'alter', 'add', 'column', 'primary',
            'key', 'foreign', 'references', 'index', 'unique', 'not', 'null', 'default',
            'check', 'constraint', 'join', 'inner', 'left', 'right', 'outer', 'on',
            'group', 'by', 'having', 'order', 'asc', 'desc', 'limit', 'offset', 'union',
            'all', 'distinct', 'as', 'and', 'or', 'like', 'in', 'between', 'is', 'exists',
            'case', 'when', 'then', 'else', 'end', 'cast', 'count', 'sum', 'avg', 'min',
            'max', 'coalesce', 'nullif', 'database', 'schema', 'view', 'trigger',
            'procedure', 'function', 'grant', 'revoke', 'commit', 'rollback', 'begin',
            'transaction', 'savepoint', 'explain', 'analyze', 'vacuum'
        ],
        operators: [
            '=', '!=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '%', '||'
        ],
        tokenizer: {
            root: [
                [/[a-zA-Z_][\w$]*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],
                [/--.*$/, 'comment'],
                [/'[^']*'/, 'string'],
                [/"[^"]*"/, 'string'],
                [/`[^`]*`/, 'string'],
                [/\d+\.\d+/, 'number.float'],
                [/\d+/, 'number'],
                [/@operators/, 'operator'],
                [/[;,()\[\].]/, 'delimiter'],
                [/\s+/, 'white']
            ]
        }
    });
}
