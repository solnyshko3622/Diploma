// Test file to explore syntax-parser API
import { createParser } from 'syntax-parser';

// Simple grammar to test the API
const testGrammar = {
  lexer: {
    rules: [
      { type: 'whitespace', regexes: [/^\s+/], ignore: true },
      { type: 'number', regexes: [/^\d+/] },
      { type: 'plus', regexes: [/^\+/] },
      { type: 'identifier', regexes: [/^[a-zA-Z]+/] }
    ]
  },
  grammar: {
    Expression: [
      ['number'],
      ['identifier'],
      ['Expression', 'plus', 'Expression']
    ]
  }
};

try {
  const parser = createParser(testGrammar);
  console.log('Parser created successfully:', parser);
  
  // Test parsing
  const result = parser('1 + 2');
  console.log('Parse result:', result);
  
  // Check available methods
  console.log('Parser methods:', Object.keys(parser));
  
} catch (error) {
  console.error('Error creating parser:', error);
}