# Техническая документация системы Taidon

## Оглавление
1. [Архитектура системы](#архитектура-системы)
2. [Фронтенд-приложение](#фронтенд-приложение)
3. [Библиотека SQLizer](#библиотека-sqlizer)
4. [Бэкенд-система](#бэкенд-система)
5. [API документация](#api-документация)
6. [Установка и развертывание](#установка-и-развертывание)
7. [Разработка и расширение](#разработка-и-расширение)
8. [Тестирование](#тестирование)

## Архитектура системы

### Общая схема архитектуры

```
┌─────────────────────────────────────────────────────────────┐
│                    Клиентское приложение                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React     │  │   Monaco    │  │   Состояние приложения │  │
│  │ Components  │◄─┤   Editor    │◄─┤   (Context API)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Библиотека SQLizer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Parser    │  │ Validation  │  │ Monaco Integration  │  │
│  │   (Lexer)   │─►│   Engine    │─►│    Providers       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Бэкенд сервер                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Express   │  │   Auth      │  │   Data Models      │  │
│  │   Router    │◄─┤   Middleware│◄─┤   (In-memory)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Технологический стек

**Фронтенд:**
- React 19.2.0 с TypeScript
- Monaco Editor 0.52.2
- React Router DOM 7.13.0
- Vite 7.3.1 (сборка)

**Библиотека:**
- TypeScript 5.0.0
- Custom SQL Parser
- Monaco Editor Integration

**Бэкенд:**
- Node.js + Express.js
- JWT аутентификация
- bcrypt для хеширования паролей

## Фронтенд-приложение

### Структура проекта

```
taidon-front/
├── src/
│   ├── components/          # React компоненты
│   │   ├── SQLEditor.tsx    # Редактор SQL
│   │   ├── TabManager.tsx   # Управление вкладками
│   │   ├── QueryResult.tsx  # Отображение результатов
│   │   └── ...
│   ├── contexts/           # Контексты состояния
│   │   └── AppContext.tsx  # Глобальное состояние
│   ├── services/           # Сервисы API
│   │   ├── apiService.ts   # HTTP клиент
│   │   └── databaseService.ts # Сервис БД
│   ├── types/             # TypeScript типы
│   │   └── index.ts       # Основные интерфейсы
│   ├── utils/             # Утилиты
│   │   └── sqlErrorHighlighter.ts # Валидатор ошибок
│   └── App.tsx           # Корневой компонент
├── public/               # Статические файлы
└── package.json         # Зависимости
```

### Ключевые компоненты

**AppContext (Управление состоянием)**
```typescript
interface AppState {
  auth: AuthState;
  connections: DatabaseConnection[];
  tabs: Tab[];
  activeTabId: string;
  // ... другие состояния
}
```

**SQLEditor (Редактор SQL)**
- Интеграция с Monaco Editor
- Валидация в реальном времени
- Горячие клавиши (Ctrl+Enter)
- Подсветка синтаксиса

**TabManager (Управление вкладками)**
- Создание/закрытие вкладок
- Переключение между запросами
- Автосохранение содержимого

### Сервисный слой

**apiService.ts**
```typescript
export const authAPI = {
  async login(email: string, password: string) {
    // Аутентификация пользователя
  }
};

export const projectsAPI = {
  async getAll() {
    // Получение списка проектов
  }
};
```

## Библиотека SQLizer

### Архитектура парсера

```
┌─────────────────┐
│   SQL Parser    │
│  ┌─────────────┐ │
│  │   Lexer     │ │  Токенизация
│  │ (Tokenizer) │─┼─► SQL → Токены
│  └─────────────┘ │
│  ┌─────────────┐ │
│  │   Parser    │ │  Синтаксический анализ
│  │ (Grammar)   │─┼─► Токены → AST
│  └─────────────┘ │
│  ┌─────────────┐ │
│  │ Validator   │ │  Валидация
│  │ (Rules)     │─┼─► AST → Ошибки
│  └─────────────┘ │
└─────────────────┘
```

### Класс SQLParser

**Основные методы:**
```typescript
class SQLParser {
  parse(sql: string): SQLParseResult {
    // Парсинг SQL и возврат результата
  }
  
  private validateSyntax(tokens: SQLToken[], errors: SQLError[]): void {
    // Валидация синтаксических правил
  }
}
```

**Типы токенов:**
- `keyword` - ключевые слова SQL
- `identifier` - идентификаторы (таблицы, колонки)
- `string` - строковые литералы
- `number` - числовые литералы
- `operator` - операторы (=, <, > и т.д.)
- `punctuation` - пунктуация (,, ;, () и т.д.)

### Интеграция с Monaco

**MonacoSQLValidator**
```typescript
class MonacoSQLValidator {
  validateSQL(sql: string, delay: number = 300): void {
    // Дебаунсинг валидации
  }
  
  private highlightErrors(errors: MonacoError[]): void {
    // Подсветка ошибок в редакторе
  }
}
```

**Провайдеры Monaco:**
- Completion Item Provider (автодополнение)
- Hover Provider (подсказки при наведении)
- Token Provider (подсветка синтаксиса)

## Бэкенд-система

### Структура сервера

```
mock-backend/
├── server.js          # Основной файл сервера
├── seed.js           # Инициализация данных
├── package.json      # Зависимости
└── README.md         # Документация
```

### Модели данных

**Пользователь (User)**
```javascript
{
  id: "uuid",
  name: "Имя пользователя",
  email: "email@example.com",
  password: "hashed_password",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

**Проект (Project)**
```javascript
{
  id: "uuid",
  name: "Название проекта",
  description: "Описание",
  ownerId: "user_id",
  createdAt: "2024-01-01T00:00:00.000Z",
  status: "active",
  members: [...],
  settings: {...}
}
```

**Соединение с БД (DatabaseConnection)**
```javascript
{
  id: "uuid",
  name: "Название соединения",
  type: "postgresql",
  host: "localhost",
  port: 5432,
  database: "db_name",
  username: "user",
  password: "pass"
}
```

### Аутентификация и авторизация

**JWT Middleware**
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  // Верификация токена
};
```

**Хеширование паролей**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
const validPassword = await bcrypt.compare(password, user.password);
```

## API документация

### Базовый URL
```
http://localhost:3001/api
```

### Эндпоинты аутентификации

**POST /auth/login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "jwt": "token",
  "user": { ... }
}
```

**POST /auth/register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Имя",
  "email": "user@example.com", 
  "password": "password"
}
```

### Эндпоинты проектов

**GET /projects**
- Требуется аутентификация
- Возвращает список проектов пользователя

**POST /projects**
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Новый проект",
  "description": "Описание"
}
```

### Эндпоинты соединений

**GET /database-connections**
- Список соединений для проектов пользователя

**POST /database-connections**
```http
POST /api/database-connections
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Продакшен БД",
  "type": "postgresql",
  "host": "localhost",
  "database": "mydb"
}
```

## Установка и развертывание

### Предварительные требования

- Node.js 14.0.0 или выше
- npm 6.0.0 или выше
- Современный веб-браузер

### Установка фронтенда

```bash
# Клонирование репозитория
git clone [repository-url]
cd taidon-front

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

### Установка бэкенда

```bash
cd mock-backend

# Установка зависимостей
npm install

# Запуск сервера
npm run dev

# Или в продакшене
npm start
```

### Настройка окружения

**Переменные окружения бэкенда:**
```bash
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Деплоймент

**Локальный деплоймент:**
1. Собрать фронтенд: `npm run build`
2. Запустить бэкенд: `npm start`
3. Настроить веб-сервер для раздачи статики

**Docker деплоймент:**
```dockerfile
# Пример Dockerfile для бэкенда
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Разработка и расширение

### Добавление нового типа БД

1. **Расширение типов:**
```typescript
// В types/index.ts
type DatabaseType = 'postgresql' | 'mysql' | 'sqlite' | 'oracle';
```

2. **Добавление поддержки в сервис:**
```typescript
// В databaseService.ts
class DatabaseService {
  async connectOracle(config: OracleConfig): Promise<boolean> {
    // Реализация подключения к Oracle
  }
}
```

3. **Обновление UI:**
```typescript
// В ConnectionManager.tsx
const dbTypes = ['postgresql', 'mysql', 'sqlite', 'oracle'];
```

### Расширение валидации SQL

1. **Добавление новых правил:**
```typescript
class ExtendedSQLParser extends SQLParser {
  private validateCustomRules(tokens: SQLToken[], errors: SQLError[]): void {
    // Новые правила валидации
  }
}
```

2. **Интеграция с Monaco:**
```typescript
// Новые провайдеры для расширенного функционала
monaco.languages.registerCompletionItemProvider('sql', {
  // Кастомное автодополнение
});
```

### Плагинная архитектура

**Интерфейс плагина:**
```typescript
interface TaidonPlugin {
  name: string;
  version: string;
  initialize(editor: any, monaco: any): void;
  destroy(): void;
}
```

**Регистрация плагина:**
```typescript
const plugin: TaidonPlugin = {
  name: 'MyPlugin',
  version: '1.0.0',
  initialize(editor, monaco) {
    // Инициализация плагина
  }
};

Taidon.registerPlugin(plugin);
```

## Тестирование

### Unit тесты

**Тестирование парсера:**
```typescript
describe('SQLParser', () => {
  it('should parse simple SELECT query', () => {
    const parser = new SQLParser();
    const result = parser.parse('SELECT * FROM users');
    expect(result.isValid).toBe(true);
  });
});
```

**Тестирование компонентов React:**
```typescript
describe('SQLEditor', () => {
  it('should render editor with initial value', () => {
    render(<SQLEditor tab={mockTab} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

### Интеграционные тесты

**Тестирование API:**
```javascript
describe('Projects API', () => {
  it('should create new project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project' });
    
    expect(response.status).toBe(201);
  });
});
```

### E2E тесты

**Тестирование пользовательского сценария:**
```javascript
describe('SQL Query Execution', () => {
  it('should execute query and display results', async () => {
    await page.goto('http://localhost:5173');
    await page.fill('#sql-editor', 'SELECT 1 as test');
    await page.click('#execute-button');
    await expect(page.locator('#results')).toContainText('test');
  });
});
```

### Производительность

**Бенчмарки парсера:**
```typescript
const largeQuery = generateLargeSQLQuery(1000); // 1000 строк
const startTime = performance.now();
parser.parse(largeQuery);
const endTime = performance.now();
console.log(`Parsing time: ${endTime - startTime}ms`);
```

**Нагрузочное тестирование:**
- Тестирование с множеством одновременных запросов
- Проверка использования памяти
- Мониторинг времени отклика

---

**Версия документации:** 1.0  
**Дата последнего обновления:** 09.03.2026  
**Система:** Taidon SQL Editor v1.0