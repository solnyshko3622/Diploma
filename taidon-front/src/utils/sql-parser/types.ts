// Типы для SQL парсера

export const TokenType = {
  // Ключевые слова
  KEYWORD: 'keyword',
  
  // Идентификаторы и переменные
  IDENTIFIER: 'identifier',
  VARIABLE: 'variable',
  
  // Литералы
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  NULL: 'null',
  
  // Операторы
  OPERATOR: 'operator',
  COMPARISON: 'comparison',
  LOGICAL: 'logical',
  
  // Разделители
  PUNCTUATION: 'punctuation',
  BRACKET: 'bracket',
  
  // Комментарии
  COMMENT: 'comment',
  
  // Функции
  FUNCTION: 'function',
  
  // Пробелы и переносы
  WHITESPACE: 'whitespace',
  NEWLINE: 'newline',
  
  // Ошибки
  ERROR: 'error',
  UNKNOWN: 'unknown'
} as const;

export type TokenType = typeof TokenType[keyof typeof TokenType];

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
  line: number;
  column: number;
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
  start: number;
  end: number;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ParseResult {
  tokens: Token[];
  errors: ParseError[];
  isValid: boolean;
}

export interface HighlightRange {
  from: number;
  to: number;
  className: string;
}