import type { Token, ParseError } from './types';
import { TokenType } from './types';

export class SQLSyntaxAnalyzer {
  private tokens: Token[];
  private position: number;
  private errors: ParseError[];

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter(token => 
      token.type !== TokenType.WHITESPACE && 
      token.type !== TokenType.NEWLINE &&
      token.type !== TokenType.COMMENT
    );
    this.position = 0;
    this.errors = [];
  }

  analyze(): ParseError[] {
    this.errors = [];
    this.position = 0;

    try {
      this.parseStatements();
    } catch (error) {
      // Обработка неожиданных ошибок
    }

    // Дополнительные проверки
    this.checkUnmatchedBrackets();
    this.checkUnterminatedStrings();
    this.checkInvalidKeywordSequences();

    return this.errors;
  }

  private parseStatements(): void {
    while (this.position < this.tokens.length) {
      this.parseStatement();
      this.skipSemicolons();
    }
  }

  private parseStatement(): void {
    if (this.position >= this.tokens.length) return;

    const token = this.currentToken();
    if (!token) return;

    const keyword = token.value.toUpperCase();

    switch (keyword) {
      case 'SELECT':
        this.parseSelectStatement();
        break;
      case 'INSERT':
        this.parseInsertStatement();
        break;
      case 'UPDATE':
        this.parseUpdateStatement();
        break;
      case 'DELETE':
        this.parseDeleteStatement();
        break;
      case 'CREATE':
        this.parseCreateStatement();
        break;
      case 'ALTER':
        this.parseAlterStatement();
        break;
      case 'DROP':
        this.parseDropStatement();
        break;
      default:
        if (token.type === TokenType.KEYWORD) {
          this.addError(`Неожиданное ключевое слово: ${token.value}`, token);
        }
        this.advance();
        break;
    }
  }

  private parseSelectStatement(): void {
    this.advance(); // Пропускаем SELECT

    // Проверяем наличие колонок
    if (!this.parseSelectList()) {
      this.addError('Ожидается список колонок после SELECT', this.currentToken());
      return;
    }

    // FROM clause
    if (this.matchKeyword('FROM')) {
      this.advance();
      if (!this.parseTableReference()) {
        this.addError('Ожидается имя таблицы после FROM', this.currentToken());
      }
    }

    // WHERE clause
    if (this.matchKeyword('WHERE')) {
      this.advance();
      if (!this.parseExpression()) {
        this.addError('Ожидается условие после WHERE', this.currentToken());
      }
    }

    // GROUP BY clause
    if (this.matchKeyword('GROUP')) {
      this.advance();
      if (!this.matchKeyword('BY')) {
        this.addError('Ожидается BY после GROUP', this.currentToken());
        return;
      }
      this.advance();
      if (!this.parseExpressionList()) {
        this.addError('Ожидается список выражений после GROUP BY', this.currentToken());
      }
    }

    // HAVING clause
    if (this.matchKeyword('HAVING')) {
      this.advance();
      if (!this.parseExpression()) {
        this.addError('Ожидается условие после HAVING', this.currentToken());
      }
    }

    // ORDER BY clause
    if (this.matchKeyword('ORDER')) {
      this.advance();
      if (!this.matchKeyword('BY')) {
        this.addError('Ожидается BY после ORDER', this.currentToken());
        return;
      }
      this.advance();
      if (!this.parseOrderByList()) {
        this.addError('Ожидается список сортировки после ORDER BY', this.currentToken());
      }
    }

    // LIMIT clause
    if (this.matchKeyword('LIMIT')) {
      this.advance();
      if (!this.match(TokenType.NUMBER)) {
        this.addError('Ожидается число после LIMIT', this.currentToken());
      } else {
        this.advance();
      }
    }
  }

  private parseInsertStatement(): void {
    this.advance(); // Пропускаем INSERT

    if (!this.matchKeyword('INTO')) {
      this.addError('Ожидается INTO после INSERT', this.currentToken());
      return;
    }
    this.advance();

    if (!this.parseTableReference()) {
      this.addError('Ожидается имя таблицы после INSERT INTO', this.currentToken());
      return;
    }

    // Опциональный список колонок
    if (this.match(TokenType.BRACKET, '(')) {
      this.advance();
      if (!this.parseColumnList()) {
        this.addError('Ожидается список колонок', this.currentToken());
      }
      if (!this.match(TokenType.BRACKET, ')')) {
        this.addError('Ожидается закрывающая скобка', this.currentToken());
      } else {
        this.advance();
      }
    }

    if (this.matchKeyword('VALUES')) {
      this.advance();
      if (!this.parseValuesList()) {
        this.addError('Ожидается список значений после VALUES', this.currentToken());
      }
    } else if (this.matchKeyword('SELECT')) {
      this.parseSelectStatement();
    } else {
      this.addError('Ожидается VALUES или SELECT после INSERT INTO', this.currentToken());
    }
  }

  private parseUpdateStatement(): void {
    this.advance(); // Пропускаем UPDATE

    if (!this.parseTableReference()) {
      this.addError('Ожидается имя таблицы после UPDATE', this.currentToken());
      return;
    }

    if (!this.matchKeyword('SET')) {
      this.addError('Ожидается SET после имени таблицы', this.currentToken());
      return;
    }
    this.advance();

    if (!this.parseSetList()) {
      this.addError('Ожидается список присваиваний после SET', this.currentToken());
    }

    if (this.matchKeyword('WHERE')) {
      this.advance();
      if (!this.parseExpression()) {
        this.addError('Ожидается условие после WHERE', this.currentToken());
      }
    }
  }

  private parseDeleteStatement(): void {
    this.advance(); // Пропускаем DELETE

    if (!this.matchKeyword('FROM')) {
      this.addError('Ожидается FROM после DELETE', this.currentToken());
      return;
    }
    this.advance();

    if (!this.parseTableReference()) {
      this.addError('Ожидается имя таблицы после DELETE FROM', this.currentToken());
      return;
    }

    if (this.matchKeyword('WHERE')) {
      this.advance();
      if (!this.parseExpression()) {
        this.addError('Ожидается условие после WHERE', this.currentToken());
      }
    }
  }

  private parseCreateStatement(): void {
    this.advance(); // Пропускаем CREATE

    const token = this.currentToken();
    if (!token) {
      this.addError('Неполная инструкция CREATE', token);
      return;
    }

    const keyword = token.value.toUpperCase();
    switch (keyword) {
      case 'TABLE':
        this.parseCreateTable();
        break;
      case 'INDEX':
        this.parseCreateIndex();
        break;
      case 'VIEW':
        this.parseCreateView();
        break;
      default:
        this.addError(`Неподдерживаемый тип объекта для CREATE: ${keyword}`, token);
        break;
    }
  }

  private parseCreateTable(): void {
    this.advance(); // Пропускаем TABLE

    if (!this.match(TokenType.IDENTIFIER)) {
      this.addError('Ожидается имя таблицы', this.currentToken());
      return;
    }
    this.advance();

    if (!this.match(TokenType.BRACKET, '(')) {
      this.addError('Ожидается открывающая скобка для определения колонок', this.currentToken());
      return;
    }
    this.advance();

    if (!this.parseColumnDefinitions()) {
      this.addError('Ожидается определение колонок', this.currentToken());
    }

    if (!this.match(TokenType.BRACKET, ')')) {
      this.addError('Ожидается закрывающая скобка', this.currentToken());
    } else {
      this.advance();
    }
  }

  private parseAlterStatement(): void {
    this.advance(); // Пропускаем ALTER
    // Упрощенная реализация
    this.skipToNextStatement();
  }

  private parseDropStatement(): void {
    this.advance(); // Пропускаем DROP
    // Упрощенная реализация
    this.skipToNextStatement();
  }

  // Вспомогательные методы парсинга

  private parseSelectList(): boolean {
    if (this.match(TokenType.OPERATOR, '*')) {
      this.advance();
      return true;
    }

    return this.parseExpressionList();
  }

  private parseTableReference(): boolean {
    if (!this.match(TokenType.IDENTIFIER)) {
      return false;
    }
    this.advance();

    // Опциональный алиас
    if (this.matchKeyword('AS') || this.match(TokenType.IDENTIFIER)) {
      if (this.matchKeyword('AS')) {
        this.advance();
      }
      if (this.match(TokenType.IDENTIFIER)) {
        this.advance();
      }
    }

    return true;
  }

  private parseExpression(): boolean {
    // Упрощенная реализация выражений
    if (this.match(TokenType.IDENTIFIER) || 
        this.match(TokenType.NUMBER) || 
        this.match(TokenType.STRING) ||
        this.match(TokenType.FUNCTION)) {
      this.advance();
      
      // Проверяем операторы
      while (this.match(TokenType.OPERATOR) || 
             this.match(TokenType.COMPARISON) ||
             this.match(TokenType.LOGICAL)) {
        this.advance();
        if (!this.parseExpression()) {
          return false;
        }
      }
      
      return true;
    }

    if (this.match(TokenType.BRACKET, '(')) {
      this.advance();
      if (!this.parseExpression()) {
        return false;
      }
      if (!this.match(TokenType.BRACKET, ')')) {
        this.addError('Ожидается закрывающая скобка', this.currentToken());
        return false;
      }
      this.advance();
      return true;
    }

    return false;
  }

  private parseExpressionList(): boolean {
    if (!this.parseExpression()) {
      return false;
    }

    while (this.match(TokenType.PUNCTUATION, ',')) {
      this.advance();
      if (!this.parseExpression()) {
        this.addError('Ожидается выражение после запятой', this.currentToken());
        return false;
      }
    }

    return true;
  }

  private parseColumnList(): boolean {
    if (!this.match(TokenType.IDENTIFIER)) {
      return false;
    }
    this.advance();

    while (this.match(TokenType.PUNCTUATION, ',')) {
      this.advance();
      if (!this.match(TokenType.IDENTIFIER)) {
        this.addError('Ожидается имя колонки после запятой', this.currentToken());
        return false;
      }
      this.advance();
    }

    return true;
  }

  private parseValuesList(): boolean {
    if (!this.match(TokenType.BRACKET, '(')) {
      return false;
    }
    this.advance();

    if (!this.parseExpressionList()) {
      return false;
    }

    if (!this.match(TokenType.BRACKET, ')')) {
      this.addError('Ожидается закрывающая скобка', this.currentToken());
      return false;
    }
    this.advance();

    // Дополнительные списки значений
    while (this.match(TokenType.PUNCTUATION, ',')) {
      this.advance();
      if (!this.match(TokenType.BRACKET, '(')) {
        this.addError('Ожидается открывающая скобка для списка значений', this.currentToken());
        return false;
      }
      this.advance();

      if (!this.parseExpressionList()) {
        return false;
      }

      if (!this.match(TokenType.BRACKET, ')')) {
        this.addError('Ожидается закрывающая скобка', this.currentToken());
        return false;
      }
      this.advance();
    }

    return true;
  }

  private parseSetList(): boolean {
    if (!this.parseSetAssignment()) {
      return false;
    }

    while (this.match(TokenType.PUNCTUATION, ',')) {
      this.advance();
      if (!this.parseSetAssignment()) {
        this.addError('Ожидается присваивание после запятой', this.currentToken());
        return false;
      }
    }

    return true;
  }

  private parseSetAssignment(): boolean {
    if (!this.match(TokenType.IDENTIFIER)) {
      return false;
    }
    this.advance();

    if (!this.match(TokenType.COMPARISON, '=')) {
      this.addError('Ожидается знак равенства', this.currentToken());
      return false;
    }
    this.advance();

    return this.parseExpression();
  }

  private parseOrderByList(): boolean {
    if (!this.parseExpression()) {
      return false;
    }

    if (this.matchKeyword('ASC') || this.matchKeyword('DESC')) {
      this.advance();
    }

    while (this.match(TokenType.PUNCTUATION, ',')) {
      this.advance();
      if (!this.parseExpression()) {
        this.addError('Ожидается выражение после запятой', this.currentToken());
        return false;
      }
      if (this.matchKeyword('ASC') || this.matchKeyword('DESC')) {
        this.advance();
      }
    }

    return true;
  }

  private parseColumnDefinitions(): boolean {
    if (!this.parseColumnDefinition()) {
      return false;
    }

    while (this.match(TokenType.PUNCTUATION, ',')) {
      this.advance();
      if (!this.parseColumnDefinition()) {
        this.addError('Ожидается определение колонки после запятой', this.currentToken());
        return false;
      }
    }

    return true;
  }

  private parseColumnDefinition(): boolean {
    if (!this.match(TokenType.IDENTIFIER)) {
      return false;
    }
    this.advance();

    // Тип данных
    if (!this.match(TokenType.KEYWORD)) {
      this.addError('Ожидается тип данных', this.currentToken());
      return false;
    }
    this.advance();

    // Опциональные ограничения
    while (this.matchKeyword('NOT') || this.matchKeyword('NULL') || 
           this.matchKeyword('PRIMARY') || this.matchKeyword('UNIQUE') ||
           this.matchKeyword('DEFAULT') || this.matchKeyword('CHECK')) {
      this.advance();
      if (this.matchKeyword('NULL') || this.matchKeyword('KEY')) {
        this.advance();
      }
    }

    return true;
  }

  private parseCreateIndex(): void {
    this.advance(); // Пропускаем INDEX
    // Упрощенная реализация
    this.skipToNextStatement();
  }

  private parseCreateView(): void {
    this.advance(); // Пропускаем VIEW
    // Упрощенная реализация
    this.skipToNextStatement();
  }

  // Проверки на ошибки

  private checkUnmatchedBrackets(): void {
    const stack: Token[] = [];
    const openBrackets = ['(', '[', '{'];
    const closeBrackets = [')', ']', '}'];
    const pairs: { [key: string]: string } = { ')': '(', ']': '[', '}': '{' };

    for (const token of this.tokens) {
      if (token.type === TokenType.BRACKET) {
        if (openBrackets.includes(token.value)) {
          stack.push(token);
        } else if (closeBrackets.includes(token.value)) {
          if (stack.length === 0) {
            this.addError('Лишняя закрывающая скобка', token);
          } else {
            const lastOpen = stack.pop()!;
            if (lastOpen.value !== pairs[token.value]) {
              this.addError(`Несоответствие скобок: ожидается ${pairs[token.value]}, найдено ${lastOpen.value}`, token);
            }
          }
        }
      }
    }

    // Проверяем незакрытые скобки
    for (const unclosed of stack) {
      this.addError('Незакрытая скобка', unclosed);
    }
  }

  private checkUnterminatedStrings(): void {
    for (const token of this.tokens) {
      if (token.type === TokenType.STRING) {
        const quote = token.value[0];
        if (!token.value.endsWith(quote) || token.value.length < 2) {
          this.addError('Незакрытая строка', token);
        }
      }
    }
  }

  private checkInvalidKeywordSequences(): void {
    for (let i = 0; i < this.tokens.length - 1; i++) {
      const current = this.tokens[i];
      const next = this.tokens[i + 1];

      if (current.type === TokenType.KEYWORD && next.type === TokenType.KEYWORD) {
        const currentKeyword = current.value.toUpperCase();
        const nextKeyword = next.value.toUpperCase();

        // Проверяем недопустимые последовательности
        if (this.isInvalidKeywordSequence(currentKeyword, nextKeyword)) {
          this.addError(`Недопустимая последовательность ключевых слов: ${currentKeyword} ${nextKeyword}`, next);
        }
      }
    }
  }

  private isInvalidKeywordSequence(current: string, next: string): boolean {
    const invalidSequences = [
      ['SELECT', 'SELECT'],
      ['FROM', 'FROM'],
      ['WHERE', 'WHERE'],
      ['AND', 'AND'],
      ['OR', 'OR']
    ];

    return invalidSequences.some(([first, second]) => current === first && next === second);
  }

  // Вспомогательные методы

  private currentToken(): Token | null {
    return this.position < this.tokens.length ? this.tokens[this.position] : null;
  }

  private advance(): void {
    if (this.position < this.tokens.length) {
      this.position++;
    }
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.currentToken();
    if (!token || token.type !== type) {
      return false;
    }
    return value ? token.value === value : true;
  }

  private matchKeyword(keyword: string): boolean {
    const token = this.currentToken();
    return token?.type === TokenType.KEYWORD && token.value.toUpperCase() === keyword;
  }

  private skipSemicolons(): void {
    while (this.match(TokenType.PUNCTUATION, ';')) {
      this.advance();
    }
  }

  private skipToNextStatement(): void {
    while (this.position < this.tokens.length && 
           !this.match(TokenType.PUNCTUATION, ';') &&
           !this.matchKeyword('SELECT') &&
           !this.matchKeyword('INSERT') &&
           !this.matchKeyword('UPDATE') &&
           !this.matchKeyword('DELETE') &&
           !this.matchKeyword('CREATE') &&
           !this.matchKeyword('ALTER') &&
           !this.matchKeyword('DROP')) {
      this.advance();
    }
  }

  private addError(message: string, token: Token | null): void {
    if (token) {
      this.errors.push({
        message,
        line: token.line,
        column: token.column,
        start: token.start,
        end: token.end,
        severity: 'error'
      });
    }
  }
}