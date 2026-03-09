import { SQLToken, SQLError, SQLParseResult } from './types.js';

export class SQLParser {
  private static readonly SQL_KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN',
    'REFERENCES', 'INDEX', 'UNIQUE', 'NOT', 'NULL', 'DEFAULT', 'CHECK', 'CONSTRAINT',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'GROUP', 'BY', 'HAVING', 'ORDER',
    'ASC', 'DESC', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'AS', 'AND', 'OR',
    'LIKE', 'IN', 'BETWEEN', 'IS', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'CAST', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'DATABASE',
    'SCHEMA', 'VIEW', 'TRIGGER', 'PROCEDURE', 'FUNCTION', 'GRANT', 'REVOKE', 'COMMIT',
    'ROLLBACK', 'BEGIN', 'TRANSACTION', 'SAVEPOINT', 'EXPLAIN', 'ANALYZE', 'VACUUM'
  ]);

  private static readonly OPERATORS = new Set([
    '=', '!=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '%', '||'
  ]);

  private static readonly PUNCTUATION = new Set([
    ',', ';', '(', ')', '.', '[', ']'
  ]);

  public parse(sql: string): SQLParseResult {
    const tokens: SQLToken[] = [];
    const errors: SQLError[] = [];
    let position = 0;
    let line = 1;
    let column = 1;

    while (position < sql.length) {
      const char = sql[position];

      // Skip whitespace
      if (this.isWhitespace(char)) {
        if (char === '\n') {
          line++;
          column = 1;
        } else {
          column++;
        }
        position++;
        continue;
      }

      // Handle comments
      if (char === '-' && sql[position + 1] === '-') {
        const comment = this.parseComment(sql, position, line, column);
        tokens.push(comment);
        position = comment.end;
        line = comment.line;
        column = comment.column + comment.value.length;
        continue;
      }

      // Handle strings
      if (char === "'" || char === '"') {
        const stringToken = this.parseString(sql, position, line, column);
        if (stringToken.type === 'unknown') {
          errors.push({
            message: 'Unterminated string literal',
            start: position,
            end: sql.length,
            line,
            column,
            severity: 'error'
          });
        }
        tokens.push(stringToken);
        position = stringToken.end;
        line = stringToken.line;
        column = stringToken.column + stringToken.value.length;
        continue;
      }

      // Handle numbers
      if (this.isDigit(char)) {
        const numberToken = this.parseNumber(sql, position, line, column);
        tokens.push(numberToken);
        position = numberToken.end;
        column += numberToken.value.length;
        continue;
      }

      // Handle operators
      if (this.isOperator(char)) {
        const operatorToken = this.parseOperator(sql, position, line, column);
        tokens.push(operatorToken);
        position = operatorToken.end;
        column += operatorToken.value.length;
        continue;
      }

      // Handle punctuation
      if (this.isPunctuation(char)) {
        tokens.push({
          type: 'punctuation',
          value: char,
          start: position,
          end: position + 1,
          line,
          column
        });
        position++;
        column++;
        continue;
      }

      // Handle identifiers and keywords
      if (this.isIdentifierStart(char)) {
        const identifierToken = this.parseIdentifier(sql, position, line, column);
        tokens.push(identifierToken);
        position = identifierToken.end;
        column += identifierToken.value.length;
        continue;
      }

      // Unknown character
      errors.push({
        message: `Unexpected character: ${char}`,
        start: position,
        end: position + 1,
        line,
        column,
        severity: 'error'
      });

      tokens.push({
        type: 'unknown',
        value: char,
        start: position,
        end: position + 1,
        line,
        column
      });

      position++;
      column++;
    }

    // Validate syntax structure
    this.validateSyntax(tokens, errors);

    return {
      tokens,
      errors,
      isValid: errors.length === 0
    };
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isOperator(char: string): boolean {
    return SQLParser.OPERATORS.has(char);
  }

  private isPunctuation(char: string): boolean {
    return SQLParser.PUNCTUATION.has(char);
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private parseComment(sql: string, start: number, line: number, column: number): SQLToken {
    let end = start + 2; // Skip '--'
    let value = '--';

    while (end < sql.length && sql[end] !== '\n') {
      value += sql[end];
      end++;
    }

    return {
      type: 'comment',
      value,
      start,
      end,
      line,
      column
    };
  }

  private parseString(sql: string, start: number, line: number, column: number): SQLToken {
    const quoteChar = sql[start];
    let end = start + 1;
    let value = quoteChar;
    let escaped = false;

    while (end < sql.length) {
      const char = sql[end];
      value += char;

      if (char === quoteChar && !escaped) {
        end++;
        break;
      }

      escaped = char === '\\' && !escaped;
      end++;
    }

    // Check if string was properly terminated
    if (end >= sql.length && sql[end - 1] !== quoteChar) {
      return {
        type: 'unknown',
        value,
        start,
        end,
        line,
        column
      };
    }

    return {
      type: 'string',
      value,
      start,
      end,
      line,
      column
    };
  }

  private parseNumber(sql: string, start: number, line: number, column: number): SQLToken {
    let end = start;
    let value = '';

    // Parse integer part
    while (end < sql.length && this.isDigit(sql[end])) {
      value += sql[end];
      end++;
    }

    // Parse decimal part
    if (end < sql.length && sql[end] === '.') {
      value += sql[end];
      end++;

      while (end < sql.length && this.isDigit(sql[end])) {
        value += sql[end];
        end++;
      }
    }

    return {
      type: 'number',
      value,
      start,
      end,
      line,
      column
    };
  }

  private parseOperator(sql: string, start: number, line: number, column: number): SQLToken {
    let end = start;
    let value = sql[start];

    // Check for multi-character operators
    if (start + 1 < sql.length) {
      const twoCharOp = sql.substring(start, start + 2);
      if (SQLParser.OPERATORS.has(twoCharOp)) {
        value = twoCharOp;
        end = start + 2;
      } else {
        end = start + 1;
      }
    }

    return {
      type: 'operator',
      value,
      start,
      end,
      line,
      column
    };
  }

  private parseIdentifier(sql: string, start: number, line: number, column: number): SQLToken {
    let end = start;
    let value = '';

    while (end < sql.length && this.isIdentifierChar(sql[end])) {
      value += sql[end];
      end++;
    }

    const upperValue = value.toUpperCase();
    const type = SQLParser.SQL_KEYWORDS.has(upperValue) ? 'keyword' : 'identifier';

    return {
      type,
      value,
      start,
      end,
      line,
      column
    };
  }

  private validateSyntax(tokens: SQLToken[], errors: SQLError[]): void {
    // Basic syntax validation rules
    let parenCount = 0;
    let bracketCount = 0;
    let lastToken: SQLToken | null = null;
    let clauseOrder: string[] = []; // Track the order of clauses

    for (const token of tokens) {
      const upperValue = token.value.toUpperCase();
      
      // Track clause order for validation
      if (['SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT'].includes(upperValue)) {
        clauseOrder.push(upperValue);
      }

      // Validate parentheses and brackets
      if (token.type === 'punctuation') {
        if (token.value === '(') {
          parenCount++;
        } else if (token.value === ')') {
          parenCount--;
          if (parenCount < 0) {
            errors.push({
              message: 'Неправильная закрывающая скобка',
              start: token.start,
              end: token.end,
              line: token.line,
              column: token.column,
              severity: 'error'
            });
            parenCount = 0;
          }
        } else if (token.value === '[') {
          bracketCount++;
        } else if (token.value === ']') {
          bracketCount--;
          if (bracketCount < 0) {
            errors.push({
              message: 'Неправильная закрывающая квадратная скобка',
              start: token.start,
              end: token.end,
              line: token.line,
              column: token.column,
              severity: 'error'
            });
            bracketCount = 0;
          }
        }
      }

      // Check for common syntax errors with better context
      if (lastToken) {
        const lastUpper = lastToken.value.toUpperCase();
        
        // Two keywords in a row (except for valid combinations)
        if (lastToken.type === 'keyword' && token.type === 'keyword') {
          const allowedCombinations = [
            ['SELECT', 'DISTINCT'], ['ORDER', 'BY'], ['GROUP', 'BY'],
            ['INNER', 'JOIN'], ['LEFT', 'JOIN'], ['RIGHT', 'JOIN'], ['FULL', 'JOIN'],
            ['NOT', 'NULL'], ['PRIMARY', 'KEY'], ['FOREIGN', 'KEY'],
            ['IS', 'NOT'], ['UNION', 'ALL']
          ];

          const isAllowed = allowedCombinations.some(
            ([first, second]) => lastUpper === first && upperValue === second
          );

          if (!isAllowed) {
            errors.push({
              message: `Неправильная последовательность ключевых слов: '${lastToken.value}' перед '${token.value}'`,
              start: token.start,
              end: token.end,
              line: token.line,
              column: token.column,
              severity: 'error'
            });
          }
        }

        // Specific validation for SELECT WHERE FROM pattern
        if (lastUpper === 'SELECT' && upperValue === 'WHERE') {
          errors.push({
            message: 'WHERE не может следовать сразу после SELECT',
            start: token.start,
            end: token.end,
            line: token.line,
            column: token.column,
            severity: 'error'
          });
        }

        // Check for missing commas between identifiers (but allow SELECT column FROM pattern)
        if (lastToken.type === 'identifier' && token.type === 'identifier' &&
            lastUpper !== 'SELECT' && upperValue !== 'FROM' &&
            !(lastUpper === 'SELECT' && upperValue === 'FROM')) {
          errors.push({
            message: 'Отсутствует запятая между колонками',
            start: lastToken.end,
            end: token.start,
            line: token.line,
            column: lastToken.column + lastToken.value.length,
            severity: 'error'
          });
        }
      }

      lastToken = token;
    }

    // Validate clause order
    this.validateClauseOrder(clauseOrder, tokens, errors);

    // Check for unmatched parentheses and brackets
    if (parenCount > 0) {
      const lastParen = tokens.filter(t => t.value === '(').pop();
      if (lastParen) {
        errors.push({
          message: 'Незакрытая открывающая скобка',
          start: lastParen.start,
          end: lastParen.end,
          line: lastParen.line,
          column: lastParen.column,
          severity: 'error'
        });
      }
    }

    if (bracketCount > 0) {
      const lastBracket = tokens.filter(t => t.value === '[').pop();
      if (lastBracket) {
        errors.push({
          message: 'Незакрытая открывающая квадратная скобка',
          start: lastBracket.start,
          end: lastBracket.end,
          line: lastBracket.line,
          column: lastBracket.column,
          severity: 'error'
        });
      }
    }

    // Validate query structure
    const hasSelect = tokens.some(t => t.value.toUpperCase() === 'SELECT');
    const hasFrom = tokens.some(t => t.value.toUpperCase() === 'FROM');
    
    if (hasSelect && !hasFrom) {
      const selectToken = tokens.find(t => t.value.toUpperCase() === 'SELECT');
      if (selectToken) {
        errors.push({
          message: 'SELECT запрос должен содержать FROM',
          start: selectToken.start,
          end: selectToken.end,
          line: selectToken.line,
          column: selectToken.column,
          severity: 'error'
        });
      }
    }
  }

  private validateClauseOrder(clauseOrder: string[], tokens: SQLToken[], errors: SQLError[]): void {
    const validOrder = ['SELECT', 'FROM', 'WHERE', 'GROUP', 'HAVING', 'ORDER', 'LIMIT'];
    let lastValidIndex = -1;

    for (const clause of clauseOrder) {
      const currentIndex = validOrder.indexOf(clause);
      
      if (currentIndex === -1) continue; // Skip unknown clauses
      
      if (currentIndex < lastValidIndex) {
        // Invalid order - find the token to highlight
        const clauseToken = tokens.find(t => t.value.toUpperCase() === clause);
        if (clauseToken) {
          errors.push({
            message: `Неправильный порядок: ${clause} должен следовать после ${validOrder[lastValidIndex]}`,
            start: clauseToken.start,
            end: clauseToken.end,
            line: clauseToken.line,
            column: clauseToken.column,
            severity: 'error'
          });
        }
      } else {
        lastValidIndex = currentIndex;
      }
    }

    // Specific validation for SELECT WHERE FROM pattern
    const selectIndex = clauseOrder.indexOf('SELECT');
    const whereIndex = clauseOrder.indexOf('WHERE');
    const fromIndex = clauseOrder.indexOf('FROM');
    
    if (selectIndex !== -1 && whereIndex !== -1 && fromIndex !== -1) {
      if (whereIndex < fromIndex) {
        const whereToken = tokens.find(t => t.value.toUpperCase() === 'WHERE');
        if (whereToken) {
          errors.push({
            message: 'WHERE должен следовать после FROM',
            start: whereToken.start,
            end: whereToken.end,
            line: whereToken.line,
            column: whereToken.column,
            severity: 'error'
          });
        }
      }
    }
  }
}