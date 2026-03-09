import { SQLParser } from './parser.js';
// Test the SQL parser with various examples
const parser = new SQLParser();
const testCases = [
    {
        sql: 'SELECT * FROM users',
        description: 'Basic SELECT query'
    },
    {
        sql: 'SELECT name, age FROM users WHERE age > 18',
        description: 'SELECT with WHERE clause'
    },
    {
        sql: 'INSERT INTO users (name, age) VALUES ("John", 25)',
        description: 'INSERT statement'
    },
    {
        sql: 'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100))',
        description: 'CREATE TABLE statement'
    },
    {
        sql: 'SELECT * FROM users WHERE name = "John" AND age BETWEEN 18 AND 65',
        description: 'Complex WHERE clause'
    },
    {
        sql: 'SELECT * FROM users WHERE id IN (1, 2, 3)',
        description: 'IN clause'
    },
    {
        sql: 'SELECT * FROM users -- This is a comment',
        description: 'Query with comment'
    },
    {
        sql: 'SELECT * FROM users WHERE name = "Unterminated string',
        description: 'Unterminated string (should error)'
    },
    {
        sql: 'SELECT FROM WHERE',
        description: 'Invalid syntax (should error)'
    },
    {
        sql: 'SELECT * FROM (SELECT id FROM users)',
        description: 'Nested query'
    }
];
console.log('SQL Parser Test Results:\n');
testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`SQL: ${testCase.sql}`);
    const result = parser.parse(testCase.sql);
    console.log(`Valid: ${result.isValid}`);
    console.log(`Tokens: ${result.tokens.length}`);
    console.log(`Errors: ${result.errors.length}`);
    if (result.errors.length > 0) {
        console.log('Error details:');
        result.errors.forEach(error => {
            console.log(`  Line ${error.line}, Col ${error.column}: ${error.message}`);
        });
    }
    console.log('---\n');
});
// Test token types
console.log('Token Type Examples:');
const detailedTest = parser.parse('SELECT name FROM users WHERE age = 25');
detailedTest.tokens.forEach(token => {
    console.log(`[${token.type}] "${token.value}" (line ${token.line}, col ${token.column})`);
});
