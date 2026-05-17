// Типы токенов для SQL лексического анализатора

export const TokenType = {
  // Ключевые слова
  KEYWORD: 'KEYWORD',
  
  // Идентификаторы
  IDENTIFIER: 'IDENTIFIER',
  
  // Литералы
  STRING_LITERAL: 'STRING_LITERAL',
  NUMBER_LITERAL: 'NUMBER_LITERAL',
  
  // Операторы
  OPERATOR: 'OPERATOR',
  COMPARISON: 'COMPARISON',
  LOGICAL: 'LOGICAL',
  
  // Разделители
  DELIMITER: 'DELIMITER',
  COMMA: 'COMMA',
  SEMICOLON: 'SEMICOLON',
  DOT: 'DOT',
  
  // Скобки
  LEFT_PAREN: 'LEFT_PAREN',
  RIGHT_PAREN: 'RIGHT_PAREN',
  
  // Пробелы и комментарии
  WHITESPACE: 'WHITESPACE',
  COMMENT: 'COMMENT',
  
  // Специальные
  EOF: 'EOF',
  UNKNOWN: 'UNKNOWN'
};

// SQL ключевые слова
export const SQL_KEYWORDS = new Set([
  // Основные команды
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
  'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER',
  
  // Условия и логика
  'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
  'TRUE', 'FALSE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  
  // Группировка и сортировка
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'DISTINCT', 'ALL',
  
  // Соединения
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON', 'USING',
  
  // Агрегатные функции
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  
  // Типы данных
  'INT', 'INTEGER', 'VARCHAR', 'CHAR', 'TEXT', 'DATE', 'DATETIME', 'TIMESTAMP',
  'DECIMAL', 'FLOAT', 'DOUBLE', 'BOOLEAN', 'BLOB',
  
  // Ограничения
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT',
  'NOT', 'NULL', 'AUTO_INCREMENT',
  
  // Другие
  'AS', 'INTO', 'VALUES', 'SET', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT'
]);

// Операторы сравнения
export const COMPARISON_OPERATORS = new Set([
  '=', '!=', '<>', '<', '>', '<=', '>='
]);

// Логические операторы
export const LOGICAL_OPERATORS = new Set([
  'AND', 'OR', 'NOT'
]);

// Арифметические операторы
export const ARITHMETIC_OPERATORS = new Set([
  '+', '-', '*', '/', '%'
]);

// Класс для представления токена
export class Token {
  constructor(type, value, position, line, column) {
    this.type = type;
    this.value = value;
    this.position = position;
    this.line = line;
    this.column = column;
  }
  
  toString() {
    return `Token(${this.type}, "${this.value}", ${this.line}:${this.column})`;
  }
  
  // Проверка типа токена
  is(type) {
    return this.type === type;
  }
  
  // Проверка значения токена
  hasValue(value) {
    return this.value.toUpperCase() === value.toUpperCase();
  }
}