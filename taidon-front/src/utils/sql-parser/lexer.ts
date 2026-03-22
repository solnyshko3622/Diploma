import type { Token, ParseError } from './types';
import { TokenType } from './types';

// SQL ключевые слова
const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
  'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
  'ALTER', 'DROP', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'CONSTRAINT',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT',
  'AUTO_INCREMENT', 'IDENTITY', 'SERIAL', 'BIGSERIAL',
  'VARCHAR', 'CHAR', 'TEXT', 'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT',
  'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL', 'BOOLEAN', 'BOOL',
  'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR', 'JSON', 'JSONB',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'IFNULL', 'COALESCE',
  'CAST', 'CONVERT', 'EXTRACT', 'SUBSTRING', 'CONCAT', 'LENGTH', 'TRIM',
  'UPPER', 'LOWER', 'REPLACE', 'ROUND', 'FLOOR', 'CEIL', 'ABS', 'MOD',
  'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'INTERVAL',
  'UNION', 'INTERSECT', 'EXCEPT', 'ALL', 'DISTINCT', 'AS', 'ALIAS',
  'WITH', 'RECURSIVE', 'CTE', 'WINDOW', 'OVER', 'PARTITION', 'ROWS', 'RANGE',
  'PRECEDING', 'FOLLOWING', 'UNBOUNDED', 'CURRENT', 'ROW',
  'GRANT', 'REVOKE', 'PRIVILEGES', 'ROLE', 'USER', 'PASSWORD',
  'COMMIT', 'ROLLBACK', 'TRANSACTION', 'BEGIN', 'START', 'SAVEPOINT',
  'EXPLAIN', 'ANALYZE', 'VACUUM', 'REINDEX'
]);

// SQL функции
const SQL_FUNCTIONS = new Set([
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'STDDEV', 'VARIANCE',
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'NTILE', 'LAG', 'LEAD',
  'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE',
  'SUBSTRING', 'CONCAT', 'LENGTH', 'TRIM', 'LTRIM', 'RTRIM',
  'UPPER', 'LOWER', 'INITCAP', 'REPLACE', 'TRANSLATE',
  'ROUND', 'FLOOR', 'CEIL', 'ABS', 'MOD', 'POWER', 'SQRT',
  'SIN', 'COS', 'TAN', 'ASIN', 'ACOS', 'ATAN', 'LOG', 'LN', 'EXP',
  'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP',
  'DATE_ADD', 'DATE_SUB', 'DATEDIFF', 'DATE_FORMAT', 'EXTRACT',
  'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND',
  'CAST', 'CONVERT', 'COALESCE', 'NULLIF', 'ISNULL', 'IFNULL'
]);

// Операторы сравнения
const COMPARISON_OPERATORS = new Set(['=', '!=', '<>', '<', '>', '<=', '>=']);

// Логические операторы
const LOGICAL_OPERATORS = new Set(['AND', 'OR', 'NOT']);

// Арифметические операторы
const ARITHMETIC_OPERATORS = new Set(['+', '-', '*', '/', '%']);

export class SQLLexer {
  private input: string;
  private position: number;
  private line: number;
  private column: number;
  private tokens: Token[];
  private errors: ParseError[];

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
  }

  tokenize(): { tokens: Token[]; errors: ParseError[] } {
    this.tokens = [];
    this.errors = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;

    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.position >= this.input.length) break;

      const char = this.input[this.position];
      const start = this.position;
      const startLine = this.line;
      const startColumn = this.column;

      try {
        if (char === '\n') {
          this.addToken(TokenType.NEWLINE, char, start, this.position + 1, startLine, startColumn);
          this.advance();
          this.line++;
          this.column = 1;
        } else if (this.isWhitespace(char)) {
          this.skipWhitespace();
        } else if (char === '-' && this.peek() === '-') {
          this.tokenizeComment();
        } else if (char === '/' && this.peek() === '*') {
          this.tokenizeBlockComment();
        } else if (char === "'" || char === '"') {
          this.tokenizeString(char);
        } else if (this.isDigit(char)) {
          this.tokenizeNumber();
        } else if (this.isLetter(char) || char === '_') {
          this.tokenizeIdentifier();
        } else if (this.isOperator(char)) {
          this.tokenizeOperator();
        } else if (this.isBracket(char)) {
          this.addToken(TokenType.BRACKET, char, start, this.position + 1, startLine, startColumn);
          this.advance();
        } else if (this.isPunctuation(char)) {
          this.addToken(TokenType.PUNCTUATION, char, start, this.position + 1, startLine, startColumn);
          this.advance();
        } else {
          this.addError(`Неожиданный символ: '${char}'`, startLine, startColumn, start, this.position + 1);
          this.addToken(TokenType.ERROR, char, start, this.position + 1, startLine, startColumn);
          this.advance();
        }
      } catch (error) {
        this.addError(`Ошибка токенизации: ${error}`, startLine, startColumn, start, this.position + 1);
        this.advance();
      }
    }

    return { tokens: this.tokens, errors: this.errors };
  }

  private advance(): void {
    if (this.position < this.input.length) {
      this.position++;
      this.column++;
    }
  }

  private peek(offset: number = 1): string {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : '';
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char) && char !== '\n';
  }

  private isDigit(char: string): boolean {
    return /\d/.test(char);
  }

  private isLetter(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isOperator(char: string): boolean {
    return '=!<>+-*/%'.includes(char);
  }

  private isBracket(char: string): boolean {
    return '()[]{}'.includes(char);
  }

  private isPunctuation(char: string): boolean {
    return '.,;:'.includes(char);
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && this.isWhitespace(this.input[this.position])) {
      this.advance();
    }
  }

  private tokenizeComment(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    
    // Пропускаем '--'
    this.advance();
    this.advance();
    
    let value = '--';
    while (this.position < this.input.length && this.input[this.position] !== '\n') {
      value += this.input[this.position];
      this.advance();
    }
    
    this.addToken(TokenType.COMMENT, value, start, this.position, startLine, startColumn);
  }

  private tokenizeBlockComment(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    
    // Пропускаем '/*'
    this.advance();
    this.advance();
    
    let value = '/*';
    while (this.position < this.input.length - 1) {
      if (this.input[this.position] === '*' && this.input[this.position + 1] === '/') {
        value += '*/';
        this.advance();
        this.advance();
        break;
      }
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      }
      value += this.input[this.position];
      this.advance();
    }
    
    if (!value.endsWith('*/')) {
      this.addError('Незакрытый блочный комментарий', startLine, startColumn, start, this.position);
    }
    
    this.addToken(TokenType.COMMENT, value, start, this.position, startLine, startColumn);
  }

  private tokenizeString(quote: string): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    
    this.advance(); // Пропускаем открывающую кавычку
    
    let value = quote;
    let escaped = false;
    
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      
      if (escaped) {
        value += char;
        escaped = false;
      } else if (char === '\\') {
        value += char;
        escaped = true;
      } else if (char === quote) {
        value += char;
        this.advance();
        break;
      } else if (char === '\n') {
        this.addError('Незакрытая строка', startLine, startColumn, start, this.position);
        break;
      } else {
        value += char;
      }
      
      this.advance();
    }
    
    if (!value.endsWith(quote)) {
      this.addError('Незакрытая строка', startLine, startColumn, start, this.position);
    }
    
    this.addToken(TokenType.STRING, value, start, this.position, startLine, startColumn);
  }

  private tokenizeNumber(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    
    let value = '';
    let hasDecimal = false;
    
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      
      if (this.isDigit(char)) {
        value += char;
        this.advance();
      } else if (char === '.' && !hasDecimal) {
        hasDecimal = true;
        value += char;
        this.advance();
      } else {
        break;
      }
    }
    
    // Проверяем научную нотацию (e/E)
    if (this.position < this.input.length && 
        (this.input[this.position] === 'e' || this.input[this.position] === 'E')) {
      value += this.input[this.position];
      this.advance();
      
      if (this.position < this.input.length && 
          (this.input[this.position] === '+' || this.input[this.position] === '-')) {
        value += this.input[this.position];
        this.advance();
      }
      
      while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
        value += this.input[this.position];
        this.advance();
      }
    }
    
    this.addToken(TokenType.NUMBER, value, start, this.position, startLine, startColumn);
  }

  private tokenizeIdentifier(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    
    let value = '';
    
    while (this.position < this.input.length && this.isAlphaNumeric(this.input[this.position])) {
      value += this.input[this.position];
      this.advance();
    }
    
    const upperValue = value.toUpperCase();
    let tokenType: TokenType = TokenType.IDENTIFIER;
    
    if (SQL_KEYWORDS.has(upperValue)) {
      tokenType = TokenType.KEYWORD;
    } else if (SQL_FUNCTIONS.has(upperValue)) {
      tokenType = TokenType.FUNCTION;
    } else if (LOGICAL_OPERATORS.has(upperValue)) {
      tokenType = TokenType.LOGICAL;
    } else if (upperValue === 'TRUE' || upperValue === 'FALSE') {
      tokenType = TokenType.BOOLEAN;
    } else if (upperValue === 'NULL') {
      tokenType = TokenType.NULL;
    } else if (value.startsWith('@') || value.startsWith('$')) {
      tokenType = TokenType.VARIABLE;
    }
    
    this.addToken(tokenType, value, start, this.position, startLine, startColumn);
  }

  private tokenizeOperator(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    
    let value = this.input[this.position];
    this.advance();
    
    // Проверяем двухсимвольные операторы
    if (this.position < this.input.length) {
      const twoChar = value + this.input[this.position];
      if (COMPARISON_OPERATORS.has(twoChar)) {
        value = twoChar;
        this.advance();
      }
    }
    
    let tokenType: TokenType = TokenType.OPERATOR;
    if (COMPARISON_OPERATORS.has(value)) {
      tokenType = TokenType.COMPARISON;
    } else if (ARITHMETIC_OPERATORS.has(value)) {
      tokenType = TokenType.OPERATOR;
    }
    
    this.addToken(tokenType, value, start, this.position, startLine, startColumn);
  }

  private addToken(type: TokenType, value: string, start: number, end: number, line: number, column: number): void {
    this.tokens.push({
      type,
      value,
      start,
      end,
      line,
      column
    });
  }

  private addError(message: string, line: number, column: number, start: number, end: number): void {
    this.errors.push({
      message,
      line,
      column,
      start,
      end,
      severity: 'error'
    });
  }
}