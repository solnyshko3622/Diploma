import { 
  TokenType, 
  Token, 
  SQL_KEYWORDS, 
  COMPARISON_OPERATORS, 
  LOGICAL_OPERATORS, 
  ARITHMETIC_OPERATORS 
} from './tokenTypes.js';

export class SQLLexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
    
    // Кэш для оптимизации
    this.lastInput = '';
    this.lastTokens = [];
    this.maxTokensForRealTime = 1000; // Лимит токенов для реального времени
  }

  // Получить текущий символ
  getCurrentChar() {
    if (this.position >= this.input.length) {
      return null;
    }
    return this.input[this.position];
  }

  // Получить следующий символ без перемещения позиции
  peekChar(offset = 1) {
    const peekPos = this.position + offset;
    if (peekPos >= this.input.length) {
      return null;
    }
    return this.input[peekPos];
  }

  // Переместиться к следующему символу
  advance() {
    if (this.position < this.input.length) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  // Пропустить пробелы
  skipWhitespace() {
    while (this.getCurrentChar() && /\s/.test(this.getCurrentChar())) {
      this.advance();
    }
  }

  // Прочитать строковый литерал
  readStringLiteral() {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    const quote = this.getCurrentChar(); // ' или "
    
    this.advance(); // пропустить открывающую кавычку
    let value = '';
    
    while (this.getCurrentChar() && this.getCurrentChar() !== quote) {
      if (this.getCurrentChar() === '\\') {
        this.advance(); // пропустить обратный слеш
        if (this.getCurrentChar()) {
          // Обработка escape-последовательностей
          switch (this.getCurrentChar()) {
            case 'n': value += '\n'; break;
            case 't': value += '\t'; break;
            case 'r': value += '\r'; break;
            case '\\': value += '\\'; break;
            case '\'': value += '\''; break;
            case '"': value += '"'; break;
            default: value += this.getCurrentChar(); break;
          }
          this.advance();
        }
      } else {
        value += this.getCurrentChar();
        this.advance();
      }
    }
    
    if (this.getCurrentChar() === quote) {
      this.advance(); // пропустить закрывающую кавычку
    }
    
    return new Token(TokenType.STRING_LITERAL, value, startPos, startLine, startColumn);
  }

  // Прочитать числовой литерал
  readNumberLiteral() {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    let hasDecimalPoint = false;
    
    while (this.getCurrentChar() && (/\d/.test(this.getCurrentChar()) || this.getCurrentChar() === '.')) {
      if (this.getCurrentChar() === '.') {
        if (hasDecimalPoint) break; // второй десятичный разделитель
        hasDecimalPoint = true;
      }
      value += this.getCurrentChar();
      this.advance();
    }
    
    return new Token(TokenType.NUMBER_LITERAL, value, startPos, startLine, startColumn);
  }

  // Прочитать идентификатор или ключевое слово
  readIdentifier() {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    
    while (this.getCurrentChar() && (/[a-zA-Z0-9_]/.test(this.getCurrentChar()))) {
      value += this.getCurrentChar();
      this.advance();
    }
    
    const upperValue = value.toUpperCase();
    const tokenType = SQL_KEYWORDS.has(upperValue) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
    
    return new Token(tokenType, value, startPos, startLine, startColumn);
  }

  // Прочитать комментарий
  readComment() {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    
    if (this.getCurrentChar() === '-' && this.peekChar() === '-') {
      // Однострочный комментарий --
      while (this.getCurrentChar() && this.getCurrentChar() !== '\n') {
        value += this.getCurrentChar();
        this.advance();
      }
    } else if (this.getCurrentChar() === '/' && this.peekChar() === '*') {
      // Многострочный комментарий /* */
      this.advance(); // /
      this.advance(); // *
      value = '/*';
      
      while (this.getCurrentChar()) {
        if (this.getCurrentChar() === '*' && this.peekChar() === '/') {
          value += '*/';
          this.advance(); // *
          this.advance(); // /
          break;
        }
        value += this.getCurrentChar();
        this.advance();
      }
    }
    
    return new Token(TokenType.COMMENT, value, startPos, startLine, startColumn);
  }

  // Прочитать оператор
  readOperator() {
    const startPos = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    const char = this.getCurrentChar();
    let value = char;
    let tokenType = TokenType.OPERATOR;
    
    this.advance();
    
    // Проверка двухсимвольных операторов
    if (char === '!' && this.getCurrentChar() === '=') {
      value += this.getCurrentChar();
      this.advance();
      tokenType = TokenType.COMPARISON;
    } else if (char === '<' && (this.getCurrentChar() === '=' || this.getCurrentChar() === '>')) {
      value += this.getCurrentChar();
      this.advance();
      tokenType = TokenType.COMPARISON;
    } else if (char === '>' && this.getCurrentChar() === '=') {
      value += this.getCurrentChar();
      this.advance();
      tokenType = TokenType.COMPARISON;
    } else if (COMPARISON_OPERATORS.has(char)) {
      tokenType = TokenType.COMPARISON;
    } else if (ARITHMETIC_OPERATORS.has(char)) {
      tokenType = TokenType.OPERATOR;
    }
    
    return new Token(tokenType, value, startPos, startLine, startColumn);
  }

  // Основная функция токенизации с оптимизациями
  tokenize() {
    // Проверяем кэш
    if (this.input === this.lastInput && this.lastTokens.length > 0) {
      return this.lastTokens;
    }
    
    this.tokens = [];
    this.errors = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;
    
    const startTime = performance.now();
    let tokenCount = 0;
    
    while (this.position < this.input.length) {
      // Ограничиваем количество токенов для производительности
      if (tokenCount > this.maxTokensForRealTime) {
        console.warn('Превышен лимит токенов для реального времени анализа');
        break;
      }
      
      // Проверяем время выполнения
      if (performance.now() - startTime > 100) { // 100ms лимит
        console.warn('Превышен лимит времени для лексического анализа');
        break;
      }
      
      const char = this.getCurrentChar();
      
      if (!char) break;
      
      try {
        // Пробелы
        if (/\s/.test(char)) {
          this.skipWhitespace();
          continue;
        }
        
        // Комментарии
        if (char === '-' && this.peekChar() === '-') {
          this.tokens.push(this.readComment());
          tokenCount++;
          continue;
        }
        
        if (char === '/' && this.peekChar() === '*') {
          this.tokens.push(this.readComment());
          tokenCount++;
          continue;
        }
        
        // Строковые литералы
        if (char === '\'' || char === '"') {
          this.tokens.push(this.readStringLiteral());
          tokenCount++;
          continue;
        }
        
        // Числовые литералы
        if (/\d/.test(char)) {
          this.tokens.push(this.readNumberLiteral());
          tokenCount++;
          continue;
        }
        
        // Идентификаторы и ключевые слова
        if (/[a-zA-Z_]/.test(char)) {
          this.tokens.push(this.readIdentifier());
          tokenCount++;
          continue;
        }
        
        // Специальные символы
        const startPos = this.position;
        const startLine = this.line;
        const startColumn = this.column;
        
        switch (char) {
          case '(':
            this.tokens.push(new Token(TokenType.LEFT_PAREN, char, startPos, startLine, startColumn));
            this.advance();
            break;
          case ')':
            this.tokens.push(new Token(TokenType.RIGHT_PAREN, char, startPos, startLine, startColumn));
            this.advance();
            break;
          case ',':
            this.tokens.push(new Token(TokenType.COMMA, char, startPos, startLine, startColumn));
            this.advance();
            break;
          case ';':
            this.tokens.push(new Token(TokenType.SEMICOLON, char, startPos, startLine, startColumn));
            this.advance();
            break;
          case '.':
            this.tokens.push(new Token(TokenType.DOT, char, startPos, startLine, startColumn));
            this.advance();
            break;
          default:
            // Операторы
            if (/[+\-*/%=!<>]/.test(char)) {
              this.tokens.push(this.readOperator());
            } else {
              // Неизвестный символ - добавляем в ошибки
              const errorToken = new Token(TokenType.UNKNOWN, char, startPos, startLine, startColumn);
              this.tokens.push(errorToken);
              this.errors.push({
                message: `Неизвестный символ: '${char}'`,
                line: startLine,
                column: startColumn,
                type: 'lexical'
              });
              this.advance();
            }
            break;
        }
        tokenCount++;
      } catch (error) {
        // Обработка ошибок лексера
        this.errors.push({
          message: `Ошибка лексического анализа: ${error.message}`,
          line: this.line,
          column: this.column,
          type: 'lexical'
        });
        this.advance(); // Пропускаем проблемный символ
      }
    }
    
    // Добавить токен конца файла
    this.tokens.push(new Token(TokenType.EOF, '', this.position, this.line, this.column));
    
    // Кэшируем результат
    this.lastInput = this.input;
    this.lastTokens = [...this.tokens];
    
    return this.tokens;
  }

  // Получить статистику токенов
  getTokenStats() {
    const stats = {};
    this.tokens.forEach(token => {
      stats[token.type] = (stats[token.type] || 0) + 1;
    });
    return stats;
  }

  // Фильтрация токенов по типу
  getTokensByType(type) {
    return this.tokens.filter(token => token.type === type);
  }

  // Получить все ошибки (неизвестные токены)
  getErrors() {
    return this.tokens.filter(token => token.type === TokenType.UNKNOWN);
  }
}