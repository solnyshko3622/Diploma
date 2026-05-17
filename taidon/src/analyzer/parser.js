import { TokenType } from './tokenTypes.js';
import {
  Program, SelectStatement, InsertStatement, UpdateStatement, DeleteStatement,
  CreateTableStatement, SelectList, SelectItem, FromClause, TableReference,
  JoinExpression, WhereClause, GroupByClause, OrderByClause, OrderByItem,
  LimitClause, BinaryExpression, UnaryExpression, Identifier, Literal,
  FunctionCall, ColumnDefinition, ColumnConstraint, SyntaxError
} from './ast.js';

export class SQLParser {
  constructor(tokens) {
    this.tokens = tokens.filter(token => token.type !== TokenType.WHITESPACE);
    this.position = 0;
    this.errors = [];
    this.maxErrors = 10; // Лимит ошибок для производительности
    this.parseTimeout = 50; // 50ms лимит для парсинга
    this.startTime = null;
  }

  // Получить текущий токен
  getCurrentToken() {
    if (this.position >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // EOF токен
    }
    return this.tokens[this.position];
  }

  // Получить следующий токен без перемещения позиции
  peekToken(offset = 1) {
    const peekPos = this.position + offset;
    if (peekPos >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // EOF токен
    }
    return this.tokens[peekPos];
  }

  // Переместиться к следующему токену
  advance() {
    if (this.position < this.tokens.length - 1) {
      this.position++;
    }
    return this.getCurrentToken();
  }

  // Проверить, соответствует ли текущий токен ожидаемому типу
  match(tokenType) {
    return this.getCurrentToken().type === tokenType;
  }

  // Проверить, соответствует ли текущий токен ожидаемому значению
  matchValue(value) {
    return this.getCurrentToken().hasValue(value);
  }

  // Проверить, достигнут ли конец токенов
  isAtEnd() {
    return this.position >= this.tokens.length || this.match(TokenType.EOF);
  }

  // Потребовать токен определенного типа
  expect(tokenType, errorMessage = null) {
    const token = this.getCurrentToken();
    if (token.type !== tokenType) {
      const message = errorMessage || `Ожидался ${tokenType}, получен ${token.type}`;
      this.addError(message, token);
      return null;
    }
    this.advance();
    return token;
  }

  // Потребовать токен с определенным значением
  expectValue(value, errorMessage = null) {
    const token = this.getCurrentToken();
    if (!token.hasValue(value)) {
      const message = errorMessage || `Ожидался "${value}", получен "${token.value}"`;
      this.addError(message, token);
      return null;
    }
    this.advance();
    return token;
  }

  // Добавить ошибку
  addError(message, token) {
    this.errors.push(new SyntaxError(message, token.position, token.line, token.column));
  }

  // Основная функция парсинга с оптимизациями
  parse() {
    this.startTime = performance.now();
    const statements = [];
    
    while (!this.match(TokenType.EOF)) {
      // Проверяем лимиты производительности
      if (this.errors.length >= this.maxErrors) {
        console.warn('Превышен лимит ошибок парсинга');
        break;
      }
      
      if (performance.now() - this.startTime > this.parseTimeout) {
        console.warn('Превышен лимит времени парсинга');
        break;
      }
      
      try {
        const statement = this.parseStatement();
        if (statement) {
          statements.push(statement);
        }
        
        // Пропустить точку с запятой если есть
        if (this.match(TokenType.SEMICOLON)) {
          this.advance();
        }
      } catch (error) {
        this.addError(error.message || 'Ошибка парсинга', this.getCurrentToken());
        // Попытаться восстановиться, пропустив до следующего ключевого слова
        this.skipToNextStatement();
      }
    }
    
    return new Program(statements);
  }

  // Парсинг отдельного выражения
  parseStatement() {
    const token = this.getCurrentToken();
    
    if (token.type !== TokenType.KEYWORD) {
      this.addError('Ожидалось ключевое слово', token);
      return null;
    }
    
    switch (token.value.toUpperCase()) {
      case 'SELECT':
        return this.parseSelectStatement();
      case 'INSERT':
        return this.parseInsertStatement();
      case 'UPDATE':
        return this.parseUpdateStatement();
      case 'DELETE':
        return this.parseDeleteStatement();
      case 'CREATE':
        return this.parseCreateStatement();
      default:
        this.addError(`Неподдерживаемое ключевое слово: ${token.value}`, token);
        return null;
    }
  }

  // Парсинг SELECT выражения
  parseSelectStatement() {
    this.expectValue('SELECT');
    
    // Проверка на DISTINCT
    let distinct = false;
    if (this.matchValue('DISTINCT')) {
      distinct = true;
      this.advance();
    }
    
    // Парсинг списка выбора
    const selectList = this.parseSelectList(distinct);
    
    // FROM клауза (опциональная)
    let fromClause = null;
    if (this.matchValue('FROM')) {
      fromClause = this.parseFromClause();
    }
    
    // WHERE клауза (опциональная)
    let whereClause = null;
    if (this.matchValue('WHERE')) {
      whereClause = this.parseWhereClause();
    }
    
    // GROUP BY клауза (опциональная)
    let groupByClause = null;
    if (this.matchValue('GROUP')) {
      groupByClause = this.parseGroupByClause();
    }
    
    // ORDER BY клауза (опциональная)
    let orderByClause = null;
    if (this.matchValue('ORDER')) {
      orderByClause = this.parseOrderByClause();
    }
    
    // LIMIT клауза (опциональная)
    let limitClause = null;
    if (this.matchValue('LIMIT')) {
      limitClause = this.parseLimitClause();
    }
    
    return new SelectStatement(selectList, fromClause, whereClause, 
                              groupByClause, null, orderByClause, limitClause);
  }

  // Парсинг списка выбора
  parseSelectList(distinct = false) {
    const items = [];
    
    do {
      // Проверка на *
      if (this.getCurrentToken().value === '*') {
        items.push(new SelectItem(new Identifier('*')));
        this.advance();
      } else {
        const expression = this.parseExpression();
        let alias = null;
        
        // Проверка на псевдоним
        if (this.matchValue('AS')) {
          this.advance();
          if (this.match(TokenType.IDENTIFIER)) {
            alias = this.getCurrentToken().value;
            this.advance();
          }
        } else if (this.match(TokenType.IDENTIFIER) && 
                   !this.isKeyword(this.getCurrentToken().value)) {
          alias = this.getCurrentToken().value;
          this.advance();
        }
        
        items.push(new SelectItem(expression, alias));
      }
      
      if (this.match(TokenType.COMMA)) {
        this.advance();
      } else {
        break;
      }
    } while (true);
    
    return new SelectList(items, distinct);
  }

  // Парсинг FROM клаузы
  parseFromClause() {
    this.expectValue('FROM');
    const tableReferences = [];
    
    do {
      const tableRef = this.parseTableReference();
      tableReferences.push(tableRef);
      
      // Проверка на JOIN
      if (this.isJoinKeyword(this.getCurrentToken().value)) {
        const joinExpr = this.parseJoinExpression(tableRef);
        tableReferences[tableReferences.length - 1] = joinExpr;
      }
      
      if (this.match(TokenType.COMMA)) {
        this.advance();
      } else {
        break;
      }
    } while (true);
    
    return new FromClause(tableReferences);
  }

  // Парсинг ссылки на таблицу
  parseTableReference() {
    if (!this.match(TokenType.IDENTIFIER)) {
      this.addError('Ожидалось имя таблицы', this.getCurrentToken());
      return null;
    }
    
    const tableName = this.getCurrentToken().value;
    this.advance();
    
    let alias = null;
    if (this.matchValue('AS')) {
      this.advance();
      if (this.match(TokenType.IDENTIFIER)) {
        alias = this.getCurrentToken().value;
        this.advance();
      }
    } else if (this.match(TokenType.IDENTIFIER) && 
               !this.isKeyword(this.getCurrentToken().value)) {
      alias = this.getCurrentToken().value;
      this.advance();
    }
    
    return new TableReference(tableName, alias);
  }

  // Парсинг WHERE клаузы
  parseWhereClause() {
    this.expectValue('WHERE');
    const condition = this.parseExpression();
    return new WhereClause(condition);
  }

  // Парсинг выражения
  parseExpression() {
    return this.parseOrExpression();
  }

  // Парсинг OR выражения
  parseOrExpression() {
    let left = this.parseAndExpression();
    
    while (this.matchValue('OR')) {
      const operator = this.getCurrentToken().value;
      this.advance();
      const right = this.parseAndExpression();
      left = new BinaryExpression(left, operator, right);
    }
    
    return left;
  }

  // Парсинг AND выражения
  parseAndExpression() {
    let left = this.parseComparisonExpression();
    
    while (this.matchValue('AND')) {
      const operator = this.getCurrentToken().value;
      this.advance();
      const right = this.parseComparisonExpression();
      left = new BinaryExpression(left, operator, right);
    }
    
    return left;
  }

  // Парсинг выражения сравнения
  parseComparisonExpression() {
    let left = this.parseAdditiveExpression();
    
    if (this.match(TokenType.COMPARISON) || 
        this.matchValue('LIKE') || this.matchValue('IN') || 
        this.matchValue('IS') || this.matchValue('BETWEEN')) {
      const operator = this.getCurrentToken().value;
      this.advance();
      const right = this.parseAdditiveExpression();
      left = new BinaryExpression(left, operator, right);
    }
    
    return left;
  }

  // Парсинг арифметического выражения
  parseAdditiveExpression() {
    let left = this.parseMultiplicativeExpression();
    
    while (this.getCurrentToken().value === '+' || this.getCurrentToken().value === '-') {
      const operator = this.getCurrentToken().value;
      this.advance();
      const right = this.parseMultiplicativeExpression();
      left = new BinaryExpression(left, operator, right);
    }
    
    return left;
  }

  // Парсинг мультипликативного выражения
  parseMultiplicativeExpression() {
    let left = this.parsePrimaryExpression();
    
    while (this.getCurrentToken().value === '*' || 
           this.getCurrentToken().value === '/' || 
           this.getCurrentToken().value === '%') {
      const operator = this.getCurrentToken().value;
      this.advance();
      const right = this.parsePrimaryExpression();
      left = new BinaryExpression(left, operator, right);
    }
    
    return left;
  }

  // Парсинг первичного выражения
  parsePrimaryExpression() {
    const token = this.getCurrentToken();
    
    // Литералы
    if (token.type === TokenType.STRING_LITERAL) {
      this.advance();
      return new Literal(token.value, 'STRING');
    }
    
    if (token.type === TokenType.NUMBER_LITERAL) {
      this.advance();
      return new Literal(token.value, 'NUMBER');
    }
    
    // NULL
    if (token.hasValue('NULL')) {
      this.advance();
      return new Literal(null, 'NULL');
    }
    
    // Скобки
    if (token.type === TokenType.LEFT_PAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RIGHT_PAREN);
      return expr;
    }
    
    // Функции или идентификаторы
    if (token.type === TokenType.IDENTIFIER) {
      const name = token.value;
      this.advance();
      
      // Проверка на функцию
      if (this.match(TokenType.LEFT_PAREN)) {
        this.advance();
        const args = [];
        
        if (!this.match(TokenType.RIGHT_PAREN)) {
          do {
            args.push(this.parseExpression());
            if (this.match(TokenType.COMMA)) {
              this.advance();
            } else {
              break;
            }
          } while (true);
        }
        
        this.expect(TokenType.RIGHT_PAREN);
        return new FunctionCall(name, args);
      }
      
      // Проверка на qualified identifier (table.column)
      if (this.match(TokenType.DOT)) {
        this.advance();
        if (this.match(TokenType.IDENTIFIER)) {
          const columnName = this.getCurrentToken().value;
          this.advance();
          return new Identifier(columnName, name);
        }
      }
      
      return new Identifier(name);
    }
    
    this.addError('Неожиданный токен в выражении', token);
    return null;
  }

  // Вспомогательные методы
  isKeyword(value) {
    return ['SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 
            'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS',
            'AND', 'OR', 'NOT', 'IN', 'LIKE', 'IS', 'NULL', 'BETWEEN'].includes(value.toUpperCase());
  }

  isJoinKeyword(value) {
    return ['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS'].includes(value.toUpperCase());
  }

  // Восстановление после ошибки
  skipToNextStatement() {
    while (!this.match(TokenType.EOF) && !this.match(TokenType.SEMICOLON)) {
      if (this.match(TokenType.KEYWORD) && 
          ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE'].includes(this.getCurrentToken().value.toUpperCase())) {
        break;
      }
      this.advance();
    }
    
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }
  }

  // Получить все ошибки
  getErrors() {
    return this.errors;
  }

  // Заглушки для других типов выражений (для будущего расширения)
  parseInsertStatement() {
    this.addError('INSERT выражения пока не поддерживаются', this.getCurrentToken());
    return null;
  }

  parseUpdateStatement() {
    this.addError('UPDATE выражения пока не поддерживаются', this.getCurrentToken());
    return null;
  }

  parseDeleteStatement() {
    this.addError('DELETE выражения пока не поддерживаются', this.getCurrentToken());
    return null;
  }

  parseCreateStatement() {
    this.advance(); // пропускаем CREATE
    
    if (!this.match(TokenType.KEYWORD)) {
      this.addError('Ожидается ключевое слово после CREATE', this.getCurrentToken());
      return null;
    }
    
    const nextKeyword = this.getCurrentToken().value.toUpperCase();
    
    switch (nextKeyword) {
      case 'TABLE':
        return this.parseCreateTableStatement();
      case 'INDEX':
        return this.parseCreateIndexStatement();
      case 'VIEW':
        return this.parseCreateViewStatement();
      case 'DATABASE':
        return this.parseCreateDatabaseStatement();
      default:
        this.addError(`CREATE ${nextKeyword} пока не поддерживается`, this.getCurrentToken());
        return null;
    }
  }
  
  parseCreateTableStatement() {
    this.advance(); // пропускаем TABLE
    
    // Получаем имя таблицы
    if (!this.match(TokenType.IDENTIFIER)) {
      this.addError('Ожидается имя таблицы', this.getCurrentToken());
      return null;
    }
    
    const tableName = this.getCurrentToken().value;
    this.advance();
    
    // Ожидаем открывающую скобку
    if (!this.match(TokenType.LEFT_PAREN)) {
      this.addError('Ожидается "(" после имени таблицы', this.getCurrentToken());
      return null;
    }
    this.advance();
    
    // Парсим определения столбцов
    const columns = [];
    const constraints = [];
    
    do {
      // Проверяем, не закрывающая ли это скобка
      if (this.match(TokenType.RIGHT_PAREN)) {
        break;
      }
      
      // Парсим определение столбца или ограничение таблицы
      const definition = this.parseColumnDefinitionOrConstraint();
      if (definition) {
        if (definition.type === 'ColumnDefinition') {
          columns.push(definition);
        } else {
          constraints.push(definition);
        }
      }
      
      // Проверяем запятую
      if (this.match(TokenType.COMMA)) {
        this.advance();
      } else if (!this.match(TokenType.RIGHT_PAREN)) {
        this.addError('Ожидается "," или ")" в определении таблицы', this.getCurrentToken());
        break;
      }
    } while (!this.match(TokenType.RIGHT_PAREN) && !this.isAtEnd());
    
    // Ожидаем закрывающую скобку
    if (!this.match(TokenType.RIGHT_PAREN)) {
      this.addError('Ожидается ")" в конце определения таблицы', this.getCurrentToken());
      return null;
    }
    this.advance();
    
    return new CreateTableStatement(tableName, columns, constraints);
  }
  
  parseColumnDefinitionOrConstraint() {
    // Проверяем, является ли это ограничением таблицы
    if (this.match(TokenType.KEYWORD)) {
      const keyword = this.getCurrentToken().value.toUpperCase();
      if (['PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK'].includes(keyword)) {
        return this.parseTableConstraint();
      }
    }
    
    // Иначе это определение столбца
    return this.parseColumnDefinition();
  }
  
  parseColumnDefinition() {
    // Имя столбца
    if (!this.match(TokenType.IDENTIFIER)) {
      this.addError('Ожидается имя столбца', this.getCurrentToken());
      return null;
    }
    
    const columnName = this.getCurrentToken().value;
    this.advance();
    
    // Тип данных
    if (!this.match(TokenType.KEYWORD) && !this.match(TokenType.IDENTIFIER)) {
      this.addError('Ожидается тип данных столбца', this.getCurrentToken());
      return null;
    }
    
    let dataType = this.getCurrentToken().value.toUpperCase();
    this.advance();
    
    // Проверяем на размер типа данных (например, VARCHAR(255))
    if (this.match(TokenType.LEFT_PAREN)) {
      this.advance();
      if (this.match(TokenType.NUMBER_LITERAL)) {
        dataType += `(${this.getCurrentToken().value})`;
        this.advance();
        if (!this.match(TokenType.RIGHT_PAREN)) {
          this.addError('Ожидается ")" после размера типа данных', this.getCurrentToken());
          return null;
        }
        this.advance();
      } else {
        this.addError('Ожидается число в размере типа данных', this.getCurrentToken());
        return null;
      }
    }
    
    // Парсим ограничения столбца
    const constraints = [];
    while (this.match(TokenType.KEYWORD)) {
      const constraint = this.parseColumnConstraint();
      if (constraint) {
        constraints.push(constraint);
      } else {
        break;
      }
    }
    
    return new ColumnDefinition(columnName, dataType, constraints);
  }
  
  parseColumnConstraint() {
    const keyword = this.getCurrentToken().value.toUpperCase();
    
    switch (keyword) {
      case 'NOT':
        this.advance();
        if (this.matchValue('NULL')) {
          this.advance();
          return { type: 'NOT_NULL' };
        } else {
          this.addError('Ожидается NULL после NOT', this.getCurrentToken());
          return null;
        }
      
      case 'NULL':
        this.advance();
        return { type: 'NULL' };
      
      case 'PRIMARY':
        this.advance();
        if (this.matchValue('KEY')) {
          this.advance();
          return { type: 'PRIMARY_KEY' };
        } else {
          this.addError('Ожидается KEY после PRIMARY', this.getCurrentToken());
          return null;
        }
      
      case 'UNIQUE':
        this.advance();
        return { type: 'UNIQUE' };
      
      case 'AUTO_INCREMENT':
        this.advance();
        return { type: 'AUTO_INCREMENT' };
      
      case 'DEFAULT':
        this.advance();
        const defaultValue = this.parseExpression();
        return { type: 'DEFAULT', value: defaultValue };
      
      default:
        return null; // Не ограничение столбца
    }
  }
  
  parseTableConstraint() {
    const keyword = this.getCurrentToken().value.toUpperCase();
    
    switch (keyword) {
      case 'PRIMARY':
        this.advance();
        if (!this.matchValue('KEY')) {
          this.addError('Ожидается KEY после PRIMARY', this.getCurrentToken());
          return null;
        }
        this.advance();
        
        if (!this.match(TokenType.LEFT_PAREN)) {
          this.addError('Ожидается "(" после PRIMARY KEY', this.getCurrentToken());
          return null;
        }
        this.advance();
        
        const columns = this.parseColumnList();
        
        if (!this.match(TokenType.RIGHT_PAREN)) {
          this.addError('Ожидается ")" после списка столбцов', this.getCurrentToken());
          return null;
        }
        this.advance();
        
        return { type: 'PRIMARY_KEY', columns };
      
      case 'UNIQUE':
        this.advance();
        
        if (!this.match(TokenType.LEFT_PAREN)) {
          this.addError('Ожидается "(" после UNIQUE', this.getCurrentToken());
          return null;
        }
        this.advance();
        
        const uniqueColumns = this.parseColumnList();
        
        if (!this.match(TokenType.RIGHT_PAREN)) {
          this.addError('Ожидается ")" после списка столбцов', this.getCurrentToken());
          return null;
        }
        this.advance();
        
        return { type: 'UNIQUE', columns: uniqueColumns };
      
      default:
        this.addError(`Ограничение ${keyword} пока не поддерживается`, this.getCurrentToken());
        return null;
    }
  }
  
  parseColumnList() {
    const columns = [];
    
    do {
      if (!this.match(TokenType.IDENTIFIER)) {
        this.addError('Ожидается имя столбца', this.getCurrentToken());
        break;
      }
      
      columns.push(this.getCurrentToken().value);
      this.advance();
      
      if (this.match(TokenType.COMMA)) {
        this.advance();
      } else {
        break;
      }
    } while (true);
    
    return columns;
  }
  
  parseCreateIndexStatement() {
    this.advance(); // пропускаем INDEX
    this.addError('CREATE INDEX пока не поддерживается', this.getCurrentToken());
    return null;
  }
  
  parseCreateViewStatement() {
    this.advance(); // пропускаем VIEW
    this.addError('CREATE VIEW пока не поддерживается', this.getCurrentToken());
    return null;
  }
  
  parseCreateDatabaseStatement() {
    this.advance(); // пропускаем DATABASE
    this.addError('CREATE DATABASE пока не поддерживается', this.getCurrentToken());
    return null;
  }

  parseGroupByClause() {
    this.addError('GROUP BY пока не поддерживается', this.getCurrentToken());
    return null;
  }

  parseOrderByClause() {
    this.addError('ORDER BY пока не поддерживается', this.getCurrentToken());
    return null;
  }

  parseLimitClause() {
    this.addError('LIMIT пока не поддерживается', this.getCurrentToken());
    return null;
  }

  parseJoinExpression(left) {
    this.addError('JOIN выражения пока не поддерживаются', this.getCurrentToken());
    return left;
  }
}