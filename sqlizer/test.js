// Simple test to verify SQL parser functionality
import { SQLParser } from './dist/parser.js';

const parser = new SQLParser();

console.log('Testing SQLizer Parser...\n');

// Test cases
const testCases = [
  {
    sql: 'SELECT * FROM users',
    expected: 'valid'
  },
  {
    sql: 'SELECT name, age FROM users WHERE age > 18',
    expected: 'valid'
  },
  {
    sql: 'INSERT INTO users (name, age) VALUES ("John", 25)',
    expected: 'valid'
  },
  {
    sql: 'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100))',
    expected: 'valid'
  },
  {
    sql: 'SELECT * FROM users WHERE name = "Unterminated string',
    expected: 'error'
  },
  {
    sql: 'SELECT FROM WHERE',
    expected: 'error'
  }
];

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.sql}`);
  const result = parser.parse(test.sql);
  
  console.log(`  Valid: ${result.isValid}`);
  console.log(`  Tokens: ${result.tokens.length}`);
  console.log(`  Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('  Error details:');
    result.errors.forEach(error => {
      console.log(`    Line ${error.line}, Col ${error.column}: ${error.message}`);
    });
  }
  
  const passed = (test.expected === 'valid') === result.isValid;
  console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  console.log('');
});

console.log('Parser test completed!');