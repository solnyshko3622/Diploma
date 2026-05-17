// Базовые классы для AST узлов

export class ASTNode {
  constructor(type, position = null) {
    this.type = type;
    this.position = position; // позиция в исходном коде
  }
}

// Корневой узел программы
export class Program extends ASTNode {
  constructor(statements = []) {
    super('Program');
    this.statements = statements;
  }
}

// SELECT выражение
export class SelectStatement extends ASTNode {
  constructor(selectList, fromClause = null, whereClause = null, groupByClause = null, 
              havingClause = null, orderByClause = null, limitClause = null) {
    super('SelectStatement');
    this.selectList = selectList;
    this.fromClause = fromClause;
    this.whereClause = whereClause;
    this.groupByClause = groupByClause;
    this.havingClause = havingClause;
    this.orderByClause = orderByClause;
    this.limitClause = limitClause;
  }
}

// INSERT выражение
export class InsertStatement extends ASTNode {
  constructor(tableName, columns = null, values = null, selectStatement = null) {
    super('InsertStatement');
    this.tableName = tableName;
    this.columns = columns;
    this.values = values;
    this.selectStatement = selectStatement;
  }
}

// UPDATE выражение
export class UpdateStatement extends ASTNode {
  constructor(tableName, setClause, whereClause = null) {
    super('UpdateStatement');
    this.tableName = tableName;
    this.setClause = setClause;
    this.whereClause = whereClause;
  }
}

// DELETE выражение
export class DeleteStatement extends ASTNode {
  constructor(tableName, whereClause = null) {
    super('DeleteStatement');
    this.tableName = tableName;
    this.whereClause = whereClause;
  }
}

// CREATE TABLE выражение
export class CreateTableStatement extends ASTNode {
  constructor(tableName, columns, constraints = []) {
    super('CreateTableStatement');
    this.tableName = tableName;
    this.columns = columns;
    this.constraints = constraints;
  }
}

// Список выбора (SELECT list)
export class SelectList extends ASTNode {
  constructor(items, distinct = false) {
    super('SelectList');
    this.items = items;
    this.distinct = distinct;
  }
}

// Элемент списка выбора
export class SelectItem extends ASTNode {
  constructor(expression, alias = null) {
    super('SelectItem');
    this.expression = expression;
    this.alias = alias;
  }
}

// FROM клауза
export class FromClause extends ASTNode {
  constructor(tableReferences) {
    super('FromClause');
    this.tableReferences = tableReferences;
  }
}

// Ссылка на таблицу
export class TableReference extends ASTNode {
  constructor(tableName, alias = null) {
    super('TableReference');
    this.tableName = tableName;
    this.alias = alias;
  }
}

// JOIN выражение
export class JoinExpression extends ASTNode {
  constructor(left, right, joinType, condition = null) {
    super('JoinExpression');
    this.left = left;
    this.right = right;
    this.joinType = joinType; // INNER, LEFT, RIGHT, FULL
    this.condition = condition;
  }
}

// WHERE клауза
export class WhereClause extends ASTNode {
  constructor(condition) {
    super('WhereClause');
    this.condition = condition;
  }
}

// GROUP BY клауза
export class GroupByClause extends ASTNode {
  constructor(expressions) {
    super('GroupByClause');
    this.expressions = expressions;
  }
}

// ORDER BY клауза
export class OrderByClause extends ASTNode {
  constructor(items) {
    super('OrderByClause');
    this.items = items;
  }
}

// ORDER BY элемент
export class OrderByItem extends ASTNode {
  constructor(expression, direction = 'ASC') {
    super('OrderByItem');
    this.expression = expression;
    this.direction = direction; // ASC или DESC
  }
}

// LIMIT клауза
export class LimitClause extends ASTNode {
  constructor(count, offset = null) {
    super('LimitClause');
    this.count = count;
    this.offset = offset;
  }
}

// Бинарное выражение (операторы)
export class BinaryExpression extends ASTNode {
  constructor(left, operator, right) {
    super('BinaryExpression');
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

// Унарное выражение
export class UnaryExpression extends ASTNode {
  constructor(operator, operand) {
    super('UnaryExpression');
    this.operator = operator;
    this.operand = operand;
  }
}

// Идентификатор (имя столбца, таблицы и т.д.)
export class Identifier extends ASTNode {
  constructor(name, qualifier = null) {
    super('Identifier');
    this.name = name;
    this.qualifier = qualifier; // для table.column
  }
}

// Литерал (строка, число)
export class Literal extends ASTNode {
  constructor(value, dataType) {
    super('Literal');
    this.value = value;
    this.dataType = dataType; // STRING, NUMBER, BOOLEAN, NULL
  }
}

// Вызов функции
export class FunctionCall extends ASTNode {
  constructor(functionName, args = []) {
    super('FunctionCall');
    this.functionName = functionName;
    this.arguments = args;
  }
}

// Определение столбца (для CREATE TABLE)
export class ColumnDefinition extends ASTNode {
  constructor(name, dataType, constraints = []) {
    super('ColumnDefinition');
    this.name = name;
    this.dataType = dataType;
    this.constraints = constraints;
  }
}

// Ограничение столбца
export class ColumnConstraint extends ASTNode {
  constructor(type, value = null) {
    super('ColumnConstraint');
    this.type = type; // NOT_NULL, PRIMARY_KEY, UNIQUE, DEFAULT, etc.
    this.value = value;
  }
}

// Класс для синтаксических ошибок
export class SyntaxError extends Error {
  constructor(message, position, line, column) {
    super(message);
    this.name = 'SyntaxError';
    this.position = position;
    this.line = line;
    this.column = column;
  }
}