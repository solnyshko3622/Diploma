import { SQLParser, parseSQL, highlightSQL } from './index';

// Демонстрационные SQL запросы для тестирования парсера
export const demoQueries = {
  // Простой SELECT запрос
  simple: `SELECT id, name, email FROM users WHERE active = true;`,
  
  // Сложный запрос с JOIN
  complex: `SELECT 
    u.id,
    u.username,
    COUNT(t.id) AS transaction_count,
    SUM(t.amount) AS total_spent,
    AVG(t.amount) AS avg_transaction
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
WHERE t.status = 'completed'
    AND t.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.username
HAVING COUNT(t.id) > 5
ORDER BY total_spent DESC
LIMIT 100;`,

  // Запрос с ошибками
  withErrors: `SELECT id, name, email FROM users WHERE active = true AND
    -- Незакрытая скобка
    (status = 'active' 
    -- Неправильный синтаксис
    GROUP BY id, name
    -- Отсутствует FROM в подзапросе
    WHERE id IN (SELECT FROM orders);`,

  // INSERT запрос
  insert: `INSERT INTO users (name, email, created_at) 
VALUES 
    ('John Doe', 'john@example.com', NOW()),
    ('Jane Smith', 'jane@example.com', CURRENT_TIMESTAMP);`,

  // UPDATE запрос
  update: `UPDATE users 
SET 
    last_login = NOW(),
    login_count = login_count + 1
WHERE id = @user_id AND active = true;`,

  // CREATE TABLE
  createTable: `CREATE TABLE analytics_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_event (user_id, event_type),
    INDEX idx_created_at (created_at)
);`,

  // Запрос с функциями и переменными
  withFunctions: `SELECT 
    UPPER(u.name) AS display_name,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    DATE_FORMAT(u.created_at, '%Y-%m-%d') AS registration_date,
    CASE 
        WHEN u.status = 'active' THEN 'Активный'
        WHEN u.status = 'inactive' THEN 'Неактивный'
        ELSE 'Неизвестно'
    END AS status_label,
    @current_user_id AS current_user
FROM users u
WHERE u.created_at BETWEEN @start_date AND @end_date;`
};

/**
 * Функция для демонстрации работы парсера
 */
export function demonstrateParser() {
  console.log('=== Демонстрация SQL парсера ===\n');

  Object.entries(demoQueries).forEach(([name, query]) => {
    console.log(`--- ${name.toUpperCase()} ---`);
    console.log('Запрос:');
    console.log(query);
    console.log('\n');

    const result = parseSQL(query);
    
    console.log('Токены:');
    result.tokens.forEach(token => {
      if (token.type !== 'whitespace' && token.type !== 'newline') {
        console.log(`  ${token.type}: "${token.value}" (${token.start}-${token.end})`);
      }
    });
    
    console.log('\nОшибки:');
    if (result.errors.length === 0) {
      console.log('  Ошибок не найдено');
    } else {
      result.errors.forEach(error => {
        console.log(`  ${error.severity}: ${error.message} (строка ${error.line}, колонка ${error.column})`);
      });
    }
    
    console.log(`\nВалидность: ${result.isValid ? 'Валидный' : 'Содержит ошибки'}`);
    console.log('\n' + '='.repeat(50) + '\n');
  });
}

/**
 * Функция для тестирования подсветки синтаксиса
 */
export function demonstrateHighlighting() {
  console.log('=== Демонстрация подсветки синтаксиса ===\n');

  const query = demoQueries.complex;
  const ranges = highlightSQL(query);
  
  console.log('Запрос:');
  console.log(query);
  console.log('\nДиапазоны подсветки:');
  
  ranges.forEach(range => {
    const text = query.substring(range.from, range.to);
    console.log(`  ${range.className}: "${text}" (${range.from}-${range.to})`);
  });
}

/**
 * Функция для тестирования форматирования
 */
export function demonstrateFormatting() {
  console.log('=== Демонстрация форматирования ===\n');

  const unformattedQuery = `SELECT id,name,email FROM users WHERE active=true AND status='active' ORDER BY created_at DESC;`;
  
  console.log('Неформатированный запрос:');
  console.log(unformattedQuery);
  
  const parser = new SQLParser(unformattedQuery);
  const formatted = parser.format(unformattedQuery);
  
  console.log('\nФорматированный запрос:');
  console.log(formatted);
}

// Экспорт для использования в браузере
if (typeof window !== 'undefined') {
  (window as any).sqlParserDemo = {
    demonstrateParser,
    demonstrateHighlighting,
    demonstrateFormatting,
    demoQueries
  };
}