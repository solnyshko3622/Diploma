import { SQLLexer } from './lexer';
import { SQLSyntaxAnalyzer } from './syntax-analyzer';
import type { ParseResult, HighlightRange, Token, ParseError } from './types';
import { TokenType } from './types';

export class SQLParser {
  private lexer: SQLLexer;
  private syntaxAnalyzer: SQLSyntaxAnalyzer | null = null;

  constructor(input: string) {
    this.lexer = new SQLLexer(input);
  }

  /**
   * Парсит SQL код и возвращает результат с токенами и ошибками
   */
  parse(): ParseResult {
    const { tokens, errors: lexerErrors } = this.lexer.tokenize();
    
    this.syntaxAnalyzer = new SQLSyntaxAnalyzer(tokens);
    const syntaxErrors = this.syntaxAnalyzer.analyze();
    
    const allErrors = [...lexerErrors, ...syntaxErrors];
    
    return {
      tokens,
      errors: allErrors,
      isValid: allErrors.length === 0
    };
  }

  /**
   * Генерирует диапазоны для подсветки синтаксиса
   */
  getHighlightRanges(tokens: Token[]): HighlightRange[] {
    const ranges: HighlightRange[] = [];

    for (const token of tokens) {
      let className = this.getTokenClassName(token.type);
      
      if (className) {
        ranges.push({
          from: token.start,
          to: token.end,
          className
        });
      }
    }

    return ranges;
  }

  /**
   * Получает CSS класс для типа токена
   */
  private getTokenClassName(tokenType: TokenType): string {
    switch (tokenType) {
      case TokenType.KEYWORD:
        return 'sql-keyword';
      case TokenType.FUNCTION:
        return 'sql-function';
      case TokenType.STRING:
        return 'sql-string';
      case TokenType.NUMBER:
        return 'sql-number';
      case TokenType.COMMENT:
        return 'sql-comment';
      case TokenType.OPERATOR:
      case TokenType.COMPARISON:
        return 'sql-operator';
      case TokenType.LOGICAL:
        return 'sql-logical';
      case TokenType.IDENTIFIER:
        return 'sql-identifier';
      case TokenType.VARIABLE:
        return 'sql-variable';
      case TokenType.BOOLEAN:
        return 'sql-boolean';
      case TokenType.NULL:
        return 'sql-null';
      case TokenType.ERROR:
        return 'sql-error';
      default:
        return '';
    }
  }

  /**
   * Получает диагностические сообщения для редактора
   */
  getDiagnostics(errors: ParseError[]): Array<{
    from: number;
    to: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
  }> {
    return errors.map(error => ({
      from: error.start,
      to: error.end,
      severity: error.severity,
      message: error.message
    }));
  }

  /**
   * Проверяет, является ли позиция внутри строки или комментария
   */
  isInStringOrComment(tokens: Token[], position: number): boolean {
    for (const token of tokens) {
      if (position >= token.start && position <= token.end) {
        return token.type === TokenType.STRING || token.type === TokenType.COMMENT;
      }
    }
    return false;
  }

  /**
   * Получает токен в указанной позиции
   */
  getTokenAtPosition(tokens: Token[], position: number): Token | null {
    for (const token of tokens) {
      if (position >= token.start && position <= token.end) {
        return token;
      }
    }
    return null;
  }

  /**
   * Получает предложения для автодополнения
   */
  getCompletionSuggestions(tokens: Token[], position: number): Array<{
    label: string;
    type: 'keyword' | 'function' | 'table' | 'column';
    detail?: string;
  }> {
    const suggestions: Array<{
      label: string;
      type: 'keyword' | 'function' | 'table' | 'column';
      detail?: string;
    }> = [];

    // Если мы внутри строки или комментария, не предлагаем автодополнение
    if (this.isInStringOrComment(tokens, position)) {
      return suggestions;
    }

    // Базовые ключевые слова SQL
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
      'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
      'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
      'ALTER', 'DROP', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA'
    ];

    keywords.forEach(keyword => {
      suggestions.push({
        label: keyword,
        type: 'keyword',
        detail: 'SQL ключевое слово'
      });
    });

    // Функции SQL
    const functions = [
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CONCAT', 'LENGTH', 'SUBSTRING',
      'UPPER', 'LOWER', 'TRIM', 'NOW', 'CURRENT_DATE', 'CURRENT_TIME',
      'CAST', 'COALESCE', 'NULLIF', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
    ];

    functions.forEach(func => {
      suggestions.push({
        label: func,
        type: 'function',
        detail: 'SQL функция'
      });
    });

    return suggestions;
  }

  /**
   * Форматирует SQL код (базовая реализация)
   */
  format(input: string): string {
    const { tokens } = this.lexer.tokenize();
    let formatted = '';
    let indentLevel = 0;
    let needsNewLine = false;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const prevToken = i > 0 ? tokens[i - 1] : null;
      const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;

      if (token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE) {
        continue;
      }

      if (needsNewLine) {
        formatted += '\n' + '  '.repeat(indentLevel);
        needsNewLine = false;
      }

      const keyword = token.value.toUpperCase();

      // Добавляем новую строку перед основными ключевыми словами
      if (token.type === TokenType.KEYWORD) {
        if (['SELECT', 'FROM', 'WHERE', 'GROUP', 'HAVING', 'ORDER', 'LIMIT'].includes(keyword)) {
          if (formatted.trim() && !formatted.endsWith('\n')) {
            formatted += '\n' + '  '.repeat(indentLevel);
          }
        }
      }

      // Добавляем пробел перед токеном если нужно
      if (formatted && !formatted.endsWith(' ') && !formatted.endsWith('\n')) {
        if (token.type !== TokenType.PUNCTUATION || token.value === '(') {
          formatted += ' ';
        }
      }

      formatted += token.value;

      // Добавляем пробел после токена если нужно
      if (nextToken && 
          token.type !== TokenType.PUNCTUATION && 
          nextToken.type !== TokenType.PUNCTUATION) {
        formatted += ' ';
      }

      // Обработка скобок для отступов
      if (token.value === '(') {
        indentLevel++;
      } else if (token.value === ')') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
    }

    return formatted.trim();
  }
}

// Экспортируем все необходимые типы и классы
export { SQLLexer } from './lexer';
export { SQLSyntaxAnalyzer } from './syntax-analyzer';
export * from './types';

// Удобная функция для быстрого парсинга
export function parseSQL(input: string): ParseResult {
  const parser = new SQLParser(input);
  return parser.parse();
}

// Удобная функция для получения подсветки
export function highlightSQL(input: string): HighlightRange[] {
  const parser = new SQLParser(input);
  const { tokens } = parser.parse();
  return parser.getHighlightRanges(tokens);
}