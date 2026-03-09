// Test the specific query: SELECT WHERE FROM users
import { SQLParser } from './dist/parser.js';

const parser = new SQLParser();

console.log('Testing specific query: SELECT WHERE FROM users\n');

const testQuery = 'SELECT WHERE FROM users';
console.log(`Query: ${testQuery}`);

const result = parser.parse(testQuery);

console.log(`Valid: ${result.isValid}`);
console.log(`Tokens: ${result.tokens.length}`);
console.log(`Errors: ${result.errors.length}`);

if (result.errors.length > 0) {
  console.log('\nError details:');
  result.errors.forEach((error, index) => {
    console.log(`Error ${index + 1}:`);
    console.log(`  Message: ${error.message}`);
    console.log(`  Line: ${error.line}, Column: ${error.column}`);
    console.log(`  Position: ${error.start}-${error.end}`);
    console.log(`  Severity: ${error.severity}`);
  });
}

console.log('\nTokens:');
result.tokens.forEach(token => {
  console.log(`[${token.type}] "${token.value}" (line ${token.line}, col ${token.column})`);
});

// Test a few more variations
console.log('\n--- Testing variations ---');

const variations = [
  'SELECT FROM users',
  'SELECT * FROM users',
  'SELECT id FROM users WHERE',
  'SELECT WHERE id = 1 FROM users'
];

variations.forEach((query, index) => {
  console.log(`\nVariation ${index + 1}: ${query}`);
  const varResult = parser.parse(query);
  console.log(`  Valid: ${varResult.isValid}`);
  console.log(`  Errors: ${varResult.errors.length}`);
  if (varResult.errors.length > 0) {
    varResult.errors.forEach(error => {
      console.log(`    - ${error.message}`);
    });
  }
});