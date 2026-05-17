# Руководство по интеграции фронтенд компонента с Taidon API

## Обзор

Данное руководство описывает полный процесс интеграции фронтенд компонента с бэкенд API платформы Taidon для выполнения SQL запросов в изолированных средах.

## Архитектура системы

Taidon состоит из следующих компонентов:
- **sqlrs-engine** - локальный движок для выполнения SQL
- **sqlrs CLI** - интерфейс командной строки
- **HTTP API** - RESTful API для взаимодействия с движком
- **Frontend components** - компоненты пользовательского интерфейса

## Предварительные требования

### Системные требования
- Go 1.21+
- Docker Desktop (для Windows - с поддержкой Linux контейнеров)
- Node.js 18+ (для фронтенд разработки)
- WSL2 (для Windows)

### Зависимости
```bash
# Установка зависимостей проекта
npm install
```

## Сборка и запуск проекта

### 1. Сборка бинарных файлов

```bash
# Сборка движка
go build -o dist/bin/sqlrs-engine ./backend/local-engine-go/cmd/sqlrs-engine

# Сборка CLI
go build -o dist/bin/sqlrs ./frontend/cli-go/cmd/sqlrs
```

Для Windows:
```powershell
go build -o dist/bin/sqlrs-engine.exe ./backend/local-engine-go/cmd/sqlrs-engine
go build -o dist/bin/sqlrs.exe ./frontend/cli-go/cmd/sqlrs
```

### 2. Инициализация рабочего пространства

```bash
# Linux/macOS
mkdir -p sqlrs-work/{config,state,cache}

# Инициализация конфигурации
./dist/bin/sqlrs init local --snapshot auto
```

Для Windows:
```powershell
# Инициализация с btrfs (рекомендуется)
.\dist\bin\sqlrs.exe init local --snapshot btrfs

# Или с автоматическим выбором
.\dist\bin\sqlrs.exe init local --snapshot auto
```

### 3. Запуск движка

```bash
# Установка переменных окружения
export XDG_CONFIG_HOME=./sqlrs-work/config
export XDG_STATE_HOME=./sqlrs-work/state
export XDG_CACHE_HOME=./sqlrs-work/cache

# Запуск движка
./dist/bin/sqlrs-engine \
  --listen 127.0.0.1:0 \
  --run-dir ./sqlrs-work/state/sqlrs/run \
  --write-engine-json ./sqlrs-work/state/sqlrs/engine.json \
  --idle-timeout 30s
```

### 4. Проверка статуса

```bash
export SQLRS_DAEMON_PATH=./dist/bin/sqlrs-engine
./dist/bin/sqlrs status
```

## API Endpoints

### Базовый URL
```
http://127.0.0.1:{port}
```
Порт определяется автоматически и записывается в `engine.json`.

### Основные эндпоинты

#### Health Check
```http
GET /v1/health
```

#### Создание prepare job
```http
POST /v1/prepare-jobs
Content-Type: application/json

{
  "prepare_kind": "psql",
  "image_id": "postgres:17",
  "psql_args": ["-f", "/path/to/script.sql"],
  "plan_only": false
}
```

#### Получение статуса job
```http
GET /v1/prepare-jobs/{jobId}
```

#### Выполнение SQL запроса
```http
POST /v1/runs
Content-Type: application/json

{
  "instance_ref": "instance_id_or_name",
  "kind": "psql",
  "args": ["-c", "SELECT * FROM table_name;"]
}
```

## JavaScript/TypeScript клиент

### Создание API клиента

```typescript
// api-client.ts
export interface TaidonConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

export interface PrepareJobRequest {
  prepare_kind: 'psql';
  image_id: string;
  psql_args: string[];
  stdin?: string;
  plan_only?: boolean;
}

export interface PrepareJobResponse {
  job_id: string;
  status_url: string;
  events_url?: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
}

export interface RunRequest {
  instance_ref: string;
  kind: 'psql' | 'pgbench';
  args: string[];
  stdin?: string;
}

export interface RunEvent {
  type: 'start' | 'stdout' | 'stderr' | 'exit' | 'error' | 'log';
  ts: string;
  instance_id?: string;
  data?: string;
  exit_code?: number;
  error?: any;
}

export class TaidonApiClient {
  private config: TaidonConfig;

  constructor(config: TaidonConfig) {
    this.config = {
      timeout: 30000,
      retries: 1,
      ...config
    };
  }

  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/v1/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  async createPrepareJob(request: PrepareJobRequest): Promise<PrepareJobResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/prepare-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create prepare job: ${response.statusText}`);
    }

    return response.json();
  }

  async getPrepareJobStatus(jobId: string): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/v1/prepare-jobs/${jobId}`);
    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.statusText}`);
    }
    return response.json();
  }

  async waitForJobCompletion(jobId: string, pollInterval = 1000): Promise<any> {
    while (true) {
      const status = await this.getPrepareJobStatus(jobId);
      
      if (status.status === 'succeeded') {
        return status;
      }
      
      if (status.status === 'failed') {
        throw new Error(`Job failed: ${status.error?.message || 'Unknown error'}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  async runQuery(request: RunRequest): Promise<AsyncIterable<RunEvent>> {
    const response = await fetch(`${this.config.baseUrl}/v1/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to run query: ${response.statusText}`);
    }

    return this.parseNDJSONStream(response);
  }

  private async *parseNDJSONStream(response: Response): AsyncIterable<RunEvent> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              yield JSON.parse(line);
            } catch (e) {
              console.warn('Failed to parse JSON line:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
```

### Использование клиента

```typescript
// example-usage.ts
import { TaidonApiClient } from './api-client';

async function main() {
  // Инициализация клиента
  const client = new TaidonApiClient({
    baseUrl: 'http://127.0.0.1:8080' // Замените на актуальный порт
  });

  try {
    // Проверка здоровья API
    const health = await client.healthCheck();
    console.log('API Health:', health);

    // Создание prepare job для настройки базы данных
    const prepareJob = await client.createPrepareJob({
      prepare_kind: 'psql',
      image_id: 'postgres:17',
      psql_args: ['-f', '/path/to/setup.sql']
    });

    console.log('Prepare job created:', prepareJob.job_id);

    // Ожидание завершения подготовки
    const completedJob = await client.waitForJobCompletion(prepareJob.job_id);
    console.log('Database prepared:', completedJob.result);

    // Выполнение SQL запроса
    const runRequest = {
      instance_ref: completedJob.result.instance_id,
      kind: 'psql' as const,
      args: ['-c', 'SELECT * FROM flights LIMIT 10;']
    };

    console.log('Executing query...');
    for await (const event of await client.runQuery(runRequest)) {
      switch (event.type) {
        case 'stdout':
          console.log('Output:', event.data);
          break;
        case 'stderr':
          console.error('Error:', event.data);
          break;
        case 'exit':
          console.log('Query completed with exit code:', event.exit_code);
          break;
        case 'error':
          console.error('Runtime error:', event.error);
          break;
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## React компонент для SQL выполнения

```tsx
// SQLQueryComponent.tsx
import React, { useState, useCallback } from 'react';
import { TaidonApiClient, RunEvent } from './api-client';

interface SQLQueryComponentProps {
  apiClient: TaidonApiClient;
  instanceId?: string;
}

export const SQLQueryComponent: React.FC<SQLQueryComponentProps> = ({
  apiClient,
  instanceId
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = useCallback(async () => {
    if (!query.trim() || !instanceId) return;

    setIsExecuting(true);
    setError(null);
    setResults([]);

    try {
      const runRequest = {
        instance_ref: instanceId,
        kind: 'psql' as const,
        args: ['-c', query]
      };

      for await (const event of await apiClient.runQuery(runRequest)) {
        switch (event.type) {
          case 'stdout':
            if (event.data) {
              setResults(prev => [...prev, event.data]);
            }
            break;
          case 'stderr':
            if (event.data) {
              setError(prev => prev ? `${prev}\n${event.data}` : event.data);
            }
            break;
          case 'exit':
            if (event.exit_code !== 0) {
              setError(`Query failed with exit code: ${event.exit_code}`);
            }
            break;
          case 'error':
            setError(`Runtime error: ${event.error?.message || 'Unknown error'}`);
            break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsExecuting(false);
    }
  }, [query, instanceId, apiClient]);

  return (
    <div className="sql-query-component">
      <div className="query-input">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите SQL запрос..."
          rows={5}
          cols={80}
          disabled={isExecuting}
        />
      </div>
      
      <div className="controls">
        <button 
          onClick={executeQuery}
          disabled={isExecuting || !query.trim() || !instanceId}
        >
          {isExecuting ? 'Выполняется...' : 'Выполнить запрос'}
        </button>
      </div>

      {error && (
        <div className="error">
          <h4>Ошибка:</h4>
          <pre>{error}</pre>
        </div>
      )}

      {results.length > 0 && (
        <div className="results">
          <h4>Результаты:</h4>
          <pre>{results.join('\n')}</pre>
        </div>
      )}
    </div>
  );
};
```

## Валидация и обработка ошибок

### Валидация SQL запросов

```typescript
// sql-validator.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SQLValidator {
  static validateQuery(query: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Базовая валидация
    if (!query.trim()) {
      errors.push('Запрос не может быть пустым');
    }

    // Проверка на опасные операции
    const dangerousPatterns = [
      /DROP\s+DATABASE/i,
      /DROP\s+SCHEMA/i,
      /TRUNCATE/i,
      /DELETE\s+FROM\s+\w+\s*;?\s*$/i // DELETE без WHERE
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        warnings.push('Запрос содержит потенциально опасные операции');
        break;
      }
    }

    // Проверка синтаксиса (базовая)
    const openParens = (query.match(/\(/g) || []).length;
    const closeParens = (query.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Несбалансированные скобки');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
```

### Обработка ошибок API

```typescript
// error-handler.ts
export class TaidonApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'TaidonApiError';
  }
}

export function handleApiError(error: any): TaidonApiError {
  if (error instanceof TaidonApiError) {
    return error;
  }

  if (error.response) {
    return new TaidonApiError(
      error.response.data?.message || 'API request failed',
      error.response.status,
      error.response.data
    );
  }

  if (error.request) {
    return new TaidonApiError('Network error: Unable to reach API');
  }

  return new TaidonApiError(error.message || 'Unknown error');
}
```

## Примеры использования

### Пример 1: Простое выполнение запроса

```typescript
import { TaidonApiClient } from './api-client';

const client = new TaidonApiClient({
  baseUrl: 'http://127.0.0.1:8080'
});

// Выполнение простого SELECT запроса
async function simpleQuery() {
  const runRequest = {
    instance_ref: 'your-instance-id',
    kind: 'psql' as const,
    args: ['-c', 'SELECT version();']
  };

  for await (const event of await client.runQuery(runRequest)) {
    if (event.type === 'stdout') {
      console.log(event.data);
    }
  }
}
```

### Пример 2: Подготовка базы данных и выполнение запросов

```typescript
async function prepareAndQuery() {
  const client = new TaidonApiClient({
    baseUrl: 'http://127.0.0.1:8080'
  });

  // Подготовка базы данных
  const prepareJob = await client.createPrepareJob({
    prepare_kind: 'psql',
    image_id: 'postgres:17',
    psql_args: ['-f', '/path/to/schema.sql']
  });

  const result = await client.waitForJobCompletion(prepareJob.job_id);
  
  // Выполнение запросов
  const queries = [
    'SELECT COUNT(*) FROM users;',
    'SELECT * FROM products LIMIT 5;'
  ];

  for (const query of queries) {
    console.log(`Executing: ${query}`);
    
    const runRequest = {
      instance_ref: result.result.instance_id,
      kind: 'psql' as const,
      args: ['-c', query]
    };

    for await (const event of await client.runQuery(runRequest)) {
      if (event.type === 'stdout') {
        console.log(event.data);
      }
    }
  }
}
```

## Конфигурация и настройка

### Файл конфигурации (.sqlrs/config.yaml)

```yaml
client:
  output: json
  retries: 1
  timeout: 30s
defaultProfile: local
engine:
  storePath: ${StateDir}/store
orchestrator:
  daemonPath: ./dist/bin/sqlrs-engine
  idleTimeout: 120s
  runDir: ${StateDir}/run
  startupTimeout: 5s
profiles:
  local:
    auth:
      mode: fileToken
    autostart: true
    endpoint: auto
    mode: local
snapshot:
  backend: auto
```

### Переменные окружения

```bash
# Пути к рабочим директориям
export XDG_CONFIG_HOME=./sqlrs-work/config
export XDG_STATE_HOME=./sqlrs-work/state
export XDG_CACHE_HOME=./sqlrs-work/cache

# Путь к движку
export SQLRS_DAEMON_PATH=./dist/bin/sqlrs-engine

# Настройки логирования
export SQLRS_LOG_LEVEL=info
```

## Отладка и мониторинг

### Логирование

```typescript
// logger.ts
export class Logger {
  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  static info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data || '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');
  }
}
```

### Мониторинг состояния

```typescript
// health-monitor.ts
export class HealthMonitor {
  constructor(private client: TaidonApiClient) {}

  async checkHealth(): Promise<boolean> {
    try {
      await this.client.healthCheck();
      return true;
    } catch (error) {
      Logger.error('Health check failed', error);
      return false;
    }
  }

  startPeriodicCheck(intervalMs = 30000) {
    setInterval(async () => {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        Logger.error('API is not healthy');
      }
    }, intervalMs);
  }
}
```

## Заключение

Данное руководство предоставляет полную инструкцию по интеграции фронтенд компонента с Taidon API. Следуя этим инструкциям, вы сможете:

1. Собрать и запустить локальный движок Taidon
2. Создать JavaScript/TypeScript клиент для взаимодействия с API
3. Реализовать валидацию SQL запросов
4. Обрабатывать ошибки и мониторить состояние системы
5. Создать React компоненты для выполнения SQL запросов

Для получения дополнительной информации обратитесь к документации API и примерам в директории `examples/`.