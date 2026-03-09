import { createLexer, createParser, chain, matchTokenType, many, optional } from 'syntax-parser';
/**
 * SQL Lexer definition for syntax-parser
 */
export const SQLLexer = createLexer([
    // Whitespace
    {
        type: 'whitespace',
        regexes: [/^(\s+)/],
        ignore: true
    },
    // Comments
    {
        type: 'comment',
        regexes: [/^(--.*)$/]
    },
    {
        type: 'comment',
        regexes: [/^(\/\*[\s\S]*?\*\/)/]
    },
    // Strings
    {
        type: 'string',
        regexes: [/^('([^'\\]|\\.)*')/]
    },
    {
        type: 'string',
        regexes: [/^("([^"\\]|\\.)*")/]
    },
    {
        type: 'string',
        regexes: [/^(`([^`\\]|\\.)*`)/]
    },
    // Numbers
    {
        type: 'number',
        regexes: [/^(\d+\.\d+)/] // Float
    },
    {
        type: 'number',
        regexes: [/^(\d+)/] // Integer
    },
    // Operators
    {
        type: 'operator',
        regexes: [/^(!=)/, /^(<>)/, /^(<=)/, /^(>=)/, /^(=)/, /^(<)/, /^(>)/]
    },
    {
        type: 'operator',
        regexes: [/^(\+)/, /^(-)/, /^(\*)/, /^(\/)/, /^(%)/, /^(\|\|)/]
    },
    // Punctuation
    {
        type: 'punctuation',
        regexes: [/^(,)/, /^(;)/, /^(\()/, /^(\))/, /^(\.)/, /^(\[)/, /^(\])/]
    },
    // Keywords (case insensitive)
    {
        type: 'keyword',
        regexes: [
            /^(SELECT)/i, /^(FROM)/i, /^(WHERE)/i, /^(INSERT)/i, /^(INTO)/i, /^(VALUES)/i,
            /^(UPDATE)/i, /^(SET)/i, /^(DELETE)/i, /^(CREATE)/i, /^(TABLE)/i, /^(DROP)/i,
            /^(ALTER)/i, /^(ADD)/i, /^(COLUMN)/i, /^(PRIMARY)/i, /^(KEY)/i, /^(FOREIGN)/i,
            /^(REFERENCES)/i, /^(INDEX)/i, /^(UNIQUE)/i, /^(NOT)/i, /^(NULL)/i, /^(DEFAULT)/i,
            /^(CHECK)/i, /^(CONSTRAINT)/i, /^(JOIN)/i, /^(INNER)/i, /^(LEFT)/i, /^(RIGHT)/i,
            /^(OUTER)/i, /^(ON)/i, /^(GROUP)/i, /^(BY)/i, /^(HAVING)/i, /^(ORDER)/i,
            /^(ASC)/i, /^(DESC)/i, /^(LIMIT)/i, /^(OFFSET)/i, /^(UNION)/i, /^(ALL)/i,
            /^(DISTINCT)/i, /^(AS)/i, /^(AND)/i, /^(OR)/i, /^(LIKE)/i, /^(IN)/i, /^(BETWEEN)/i,
            /^(IS)/i, /^(EXISTS)/i, /^(CASE)/i, /^(WHEN)/i, /^(THEN)/i, /^(ELSE)/i, /^(END)/i,
            /^(CAST)/i, /^(COUNT)/i, /^(SUM)/i, /^(AVG)/i, /^(MIN)/i, /^(MAX)/i, /^(COALESCE)/i,
            /^(NULLIF)/i, /^(DATABASE)/i, /^(SCHEMA)/i, /^(VIEW)/i, /^(TRIGGER)/i,
            /^(PROCEDURE)/i, /^(FUNCTION)/i, /^(GRANT)/i, /^(REVOKE)/i, /^(COMMIT)/i,
            /^(ROLLBACK)/i, /^(BEGIN)/i, /^(TRANSACTION)/i, /^(SAVEPOINT)/i, /^(EXPLAIN)/i,
            /^(ANALYZE)/i, /^(VACUUM)/i
        ]
    },
    // Identifiers
    {
        type: 'identifier',
        regexes: [/^([a-zA-Z_][a-zA-Z0-9_]*)/]
    }
]);
/**
 * SQL Grammar definition using syntax-parser's functional approach
 */
// Root grammar
const root = () => chain(query)(ast => ast[0]);
const query = () => chain([
    selectStatement,
    insertStatement,
    updateStatement,
    deleteStatement,
    createStatement,
    dropStatement,
    alterStatement
])(ast => ast[0]);
// SELECT statement
const selectStatement = () => chain('SELECT', selectList, fromClause, optional(whereClause), optional(groupByClause), optional(havingClause), optional(orderByClause), optional(limitClause))(ast => ({
    type: 'SelectStatement',
    selectList: ast[1],
    fromClause: ast[2],
    whereClause: ast[3],
    groupByClause: ast[4],
    havingClause: ast[5],
    orderByClause: ast[6],
    limitClause: ast[7]
}));
const selectList = () => chain([
    chain(optional('DISTINCT'), columnList)(ast => ({
        type: 'SelectList',
        distinct: !!ast[0],
        columns: ast[1]
    })),
    chain('*')(ast => ({
        type: 'SelectList',
        distinct: false,
        columns: [{ type: 'StarColumn' }]
    }))
])(ast => ast[0]);
const columnList = () => chain(columnExpression, many(chain(',', columnExpression)(ast => ast[1])))(ast => ({
    type: 'ColumnList',
    columns: [ast[0], ...ast[1]]
}));
const columnExpression = () => chain(expression, optional(chain('AS', identifier)(ast => ast[1])))(ast => ({
    type: 'ColumnExpression',
    expression: ast[0],
    alias: ast[1]
}));
const fromClause = () => chain('FROM', tableReference)(ast => ({
    type: 'FromClause',
    table: ast[1]
}));
const tableReference = () => chain(identifier, optional(chain('AS', identifier)(ast => ast[1])), optional(joinClause))(ast => ({
    type: 'TableReference',
    name: ast[0],
    alias: ast[1],
    join: ast[2]
}));
const joinClause = () => chain([
    chain('INNER', 'JOIN', identifier, 'ON', expression)(ast => ({
        type: 'JoinClause',
        joinType: 'INNER',
        table: ast[2],
        condition: ast[4]
    })),
    chain('LEFT', optional('OUTER'), 'JOIN', identifier, 'ON', expression)(ast => ({
        type: 'JoinClause',
        joinType: 'LEFT',
        table: ast[3],
        condition: ast[5]
    })),
    chain('RIGHT', optional('OUTER'), 'JOIN', identifier, 'ON', expression)(ast => ({
        type: 'JoinClause',
        joinType: 'RIGHT',
        table: ast[3],
        condition: ast[5]
    }))
])(ast => ast[0]);
const whereClause = () => chain('WHERE', expression)(ast => ({
    type: 'WhereClause',
    condition: ast[1]
}));
const groupByClause = () => chain('GROUP', 'BY', columnList)(ast => ({
    type: 'GroupByClause',
    columns: ast[2]
}));
const havingClause = () => chain('HAVING', expression)(ast => ({
    type: 'HavingClause',
    condition: ast[1]
}));
const orderByClause = () => chain('ORDER', 'BY', orderList)(ast => ({
    type: 'OrderByClause',
    orders: ast[2]
}));
const orderList = () => chain(orderExpression, many(chain(',', orderExpression)(ast => ast[1])))(ast => ({
    type: 'OrderList',
    orders: [ast[0], ...ast[1]]
}));
const orderExpression = () => chain(expression, optional(chain(['ASC', 'DESC'])(ast => ast[0])))(ast => ({
    type: 'OrderExpression',
    expression: ast[0],
    direction: ast[1] || 'ASC'
}));
const limitClause = () => chain([
    chain('LIMIT', number)(ast => ({
        type: 'LimitClause',
        limit: ast[1],
        offset: null
    })),
    chain('LIMIT', number, 'OFFSET', number)(ast => ({
        type: 'LimitClause',
        limit: ast[1],
        offset: ast[3]
    }))
])(ast => ast[0]);
// INSERT statement
const insertStatement = () => chain([
    chain('INSERT', 'INTO', identifier, '(', columnList, ')', 'VALUES', '(', valueList, ')')(ast => ({
        type: 'InsertStatement',
        table: ast[2],
        columns: ast[4],
        values: ast[8]
    })),
    chain('INSERT', 'INTO', identifier, 'VALUES', '(', valueList, ')')(ast => ({
        type: 'InsertStatement',
        table: ast[2],
        columns: null,
        values: ast[5]
    }))
])(ast => ast[0]);
const valueList = () => chain(expression, many(chain(',', expression)(ast => ast[1])))(ast => ({
    type: 'ValueList',
    values: [ast[0], ...ast[1]]
}));
// UPDATE statement
const updateStatement = () => chain('UPDATE', identifier, 'SET', assignmentList, optional(whereClause))(ast => ({
    type: 'UpdateStatement',
    table: ast[1],
    assignments: ast[3],
    whereClause: ast[4]
}));
const assignmentList = () => chain(assignment, many(chain(',', assignment)(ast => ast[1])))(ast => ({
    type: 'AssignmentList',
    assignments: [ast[0], ...ast[1]]
}));
const assignment = () => chain(identifier, '=', expression)(ast => ({
    type: 'Assignment',
    column: ast[0],
    value: ast[2]
}));
// DELETE statement
const deleteStatement = () => chain('DELETE', 'FROM', identifier, optional(whereClause))(ast => ({
    type: 'DeleteStatement',
    table: ast[2],
    whereClause: ast[3]
}));
// CREATE statement
const createStatement = () => chain('CREATE', 'TABLE', identifier, '(', columnDefinitionList, ')')(ast => ({
    type: 'CreateStatement',
    table: ast[2],
    columns: ast[4]
}));
const columnDefinitionList = () => chain(columnDefinition, many(chain(',', columnDefinition)(ast => ast[1])))(ast => ({
    type: 'ColumnDefinitionList',
    definitions: [ast[0], ...ast[1]]
}));
const columnDefinition = () => chain(identifier, dataType, optional(columnConstraints))(ast => ({
    type: 'ColumnDefinition',
    name: ast[0],
    dataType: ast[1],
    constraints: ast[2]
}));
const dataType = () => chain([
    'INT', 'TEXT', 'DATE', 'DATETIME', 'BOOLEAN',
    chain('VARCHAR', '(', number, ')')(ast => ({ type: 'VARCHAR', length: ast[2] })),
    chain('DECIMAL', '(', number, ',', number, ')')(ast => ({ type: 'DECIMAL', precision: ast[2], scale: ast[4] }))
])(ast => ast[0]);
const columnConstraints = () => chain([
    'NOT', 'NULL',
    'PRIMARY', 'KEY',
    'UNIQUE',
    chain('DEFAULT', expression)(ast => ({ type: 'DEFAULT', value: ast[1] }))
])(ast => ast[0]);
// DROP statement
const dropStatement = () => chain('DROP', 'TABLE', identifier)(ast => ({
    type: 'DropStatement',
    table: ast[2]
}));
// ALTER statement
const alterStatement = () => chain([
    chain('ALTER', 'TABLE', identifier, 'ADD', columnDefinition)(ast => ({
        type: 'AlterStatement',
        table: ast[2],
        action: 'ADD',
        definition: ast[4]
    })),
    chain('ALTER', 'TABLE', identifier, 'DROP', 'COLUMN', identifier)(ast => ({
        type: 'AlterStatement',
        table: ast[2],
        action: 'DROP',
        column: ast[5]
    }))
])(ast => ast[0]);
// Expressions
const expression = () => chain([
    literal,
    identifier,
    functionCall,
    caseExpression,
    chain('(', expression, ')')(ast => ast[1]),
    chain(expression, operator, expression)(ast => ({
        type: 'BinaryExpression',
        left: ast[0],
        operator: ast[1],
        right: ast[2]
    }))
])(ast => ast[0]);
const functionCall = () => chain(identifier, '(', optional(argumentList), ')')(ast => ({
    type: 'FunctionCall',
    name: ast[0],
    arguments: ast[2] || []
}));
const argumentList = () => chain(expression, many(chain(',', expression)(ast => ast[1])))(ast => ({
    type: 'ArgumentList',
    arguments: [ast[0], ...ast[1]]
}));
const caseExpression = () => chain('CASE', many(whenClause), optional(elseClause), 'END')(ast => ({
    type: 'CaseExpression',
    whenClauses: ast[1],
    elseClause: ast[2]
}));
const whenClause = () => chain('WHEN', expression, 'THEN', expression)(ast => ({
    type: 'WhenClause',
    condition: ast[1],
    result: ast[3]
}));
const elseClause = () => chain('ELSE', expression)(ast => ({
    type: 'ElseClause',
    result: ast[1]
}));
const literal = () => chain([
    string,
    number,
    'NULL'
])(ast => ast[0]);
const operator = () => chain([
    '+', '-', '*', '/', '%', '=', '!=', '<>', '<', '>', '<=', '>=',
    'AND', 'OR', 'NOT', 'LIKE', 'IN', 'BETWEEN', 'IS'
])(ast => ast[0]);
// Terminal symbols
const string = () => chain(matchTokenType('string'))(ast => ({
    type: 'StringLiteral',
    value: ast[0].value
}));
const number = () => chain(matchTokenType('number'))(ast => ({
    type: 'NumberLiteral',
    value: parseFloat(ast[0].value)
}));
const identifier = () => chain(matchTokenType('identifier'))(ast => ({
    type: 'Identifier',
    name: ast[0].value
}));
// Create the parser instance
export const SQLSyntaxParser = createParser(root, SQLLexer);
/**
 * Parse SQL using syntax-parser with enhanced error reporting
 */
export function parseSQLWithSyntaxParser(sql) {
    try {
        const result = SQLSyntaxParser(sql);
        // Convert syntax-parser errors to our format
        const errors = [];
        // Check if there's a parsing error
        if (result.error) {
            const errorMessage = result.error.reason === 'wrong' ?
                `Syntax error at token: ${result.error.token.value}` :
                `Incomplete statement at token: ${result.error.token.value}`;
            errors.push({
                message: errorMessage,
                severity: 'error',
                token: result.error.token,
                line: result.error.token?.position?.[0],
                column: result.error.token?.position?.[1]
            });
        }
        // Additional semantic validation
        const semanticErrors = validateSemantics(result.ast);
        errors.push(...semanticErrors);
        return {
            ast: result.ast,
            errors,
            isValid: errors.length === 0
        };
    }
    catch (error) {
        return {
            ast: null,
            errors: [{
                    message: `Parser error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'error',
                    token: null
                }],
            isValid: false
        };
    }
}
/**
 * Perform semantic validation on the AST
 */
function validateSemantics(ast) {
    const errors = [];
    if (!ast)
        return errors;
    // Validate SELECT statement structure
    if (ast.type === 'SelectStatement') {
        // Check if SELECT has FROM clause
        if (!ast.fromClause) {
            errors.push({
                message: 'SELECT statement must have a FROM clause',
                severity: 'error',
                token: null // We don't have token info at this level
            });
        }
        // Check clause order
        validateClauseOrder(ast, errors);
    }
    // Validate INSERT statement
    if (ast.type === 'InsertStatement') {
        // Check if INSERT has VALUES
        if (!ast.values) {
            errors.push({
                message: 'INSERT statement must have VALUES clause',
                severity: 'error',
                token: null
            });
        }
    }
    return errors;
}
/**
 * Validate the order of SQL clauses
 */
function validateClauseOrder(ast, errors) {
    // This validation would need more sophisticated AST traversal
    // For now, we'll rely on the parser's structural validation
}
