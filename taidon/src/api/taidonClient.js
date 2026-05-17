// Taidon API Client для интеграции с бэкендом
export class TaidonApiClient {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || '', // Используем прокси через webpack dev server
      timeout: config.timeout || 30000,
      retries: config.retries || 1,
      instanceId: config.instanceId || null, // Будет определен динамически
      authToken: config.authToken || 'b3c61f48d546af0b09419708ad35c327fb16d84096ef3af7f03ba88a234add4f', // Актуальный токен
      ...config
    };
  }

  /**
   * Проверка здоровья API
   */
  async healthCheck() {
    try {
      console.log('Attempting health check to:', `${this.config.baseUrl}/v1/health`);
      
      const response = await fetch(`${this.config.baseUrl}/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
        mode: 'cors',
      });
      
      console.log('Health check response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Health check successful:', result);
      return result;
    } catch (error) {
      console.error('Health check error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Создание prepare job для настройки базы данных
   */
  async createPrepareJob(request) {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/prepare-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create prepare job: ${response.statusText}`, {
          cause: { status: response.status, data: errorData }
        });
      }

      return await response.json();
    } catch (error) {
      console.error('Create prepare job error:', error);
      throw error;
    }
  }

  /**
   * Получение статуса prepare job
   */
  async getPrepareJobStatus(jobId) {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/prepare-jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get prepare job status error:', error);
      throw error;
    }
  }

  /**
   * Ожидание завершения prepare job
   */
  async waitForJobCompletion(jobId, pollInterval = 1000, maxAttempts = 60) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.getPrepareJobStatus(jobId);
        
        if (status.status === 'succeeded') {
          return status;
        }
        
        if (status.status === 'failed') {
          throw new Error(`Job failed: ${status.error?.message || 'Unknown error'}`, {
            cause: status.error
          });
        }
        
        // Если статус queued или running, продолжаем ожидание
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
      } catch (error) {
        if (error.message.includes('Job failed')) {
          throw error;
        }
        // Для других ошибок пробуем еще раз
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Job completion timeout after ${maxAttempts} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    throw new Error(`Job completion timeout after ${maxAttempts} attempts`);
  }

  /**
   * Выполнение SQL запроса
   */
  async runQuery(request) {
    try {
      const requestBody = JSON.stringify(request);
      console.log('Sending run query request:', {
        url: `${this.config.baseUrl}/v1/runs`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken.substring(0, 10)}...`
        },
        body: requestBody,
        request: request
      });

      const response = await fetch(`${this.config.baseUrl}/v1/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
        body: requestBody,
      });

      console.log('Run query response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        console.error('Run query error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          errorText: errorText
        });
        
        // Extract detailed error message from backend response
        let errorMessage = errorData.message || response.statusText;
        if (errorData.details) {
          errorMessage = errorData.details;
        }
        
        // Create error with proper structure for later processing
        const error = new Error(`Failed to run query: ${errorMessage}`);
        error.backendData = errorData; // Добавляем данные бэкенда
        throw error;
      }

      return this.parseNDJSONStream(response);
    } catch (error) {
      console.error('Run query error:', error);
      throw error;
    }
  }

  /**
   * Парсинг NDJSON потока ответов
   */
  async *parseNDJSONStream(response) {
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
              console.warn('Failed to parse JSON line:', line, e);
            }
          }
        }
      }
      
      // Обрабатываем последнюю строку если она есть
      if (buffer.trim()) {
        try {
          yield JSON.parse(buffer);
        } catch (e) {
          console.warn('Failed to parse final JSON line:', buffer, e);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Валидация SQL запроса через бэкенд
   */
  async validateQuery(query, instanceId = null) {
    try {
      // Используем готовый instanceId из конфигурации или переданный параметр
      const targetInstanceId = instanceId || this.config.instanceId;

      if (!targetInstanceId) {
        throw new Error('No instance ID available for validation');
      }

      // Выполняем запрос с флагом plan_only для валидации
      const runRequest = {
        instance_ref: targetInstanceId,
        kind: 'psql',
        args: ['-c', `EXPLAIN (FORMAT JSON) ${query}`]
      };

      const events = [];
      const errors = [];
      
      for await (const event of await this.runQuery(runRequest)) {
        events.push(event);
        
        if (event.type === 'stderr' && event.data) {
          errors.push({
            message: event.data,
            line: this.extractLineNumber(event.data),
            column: this.extractColumnNumber(event.data)
          });
        }
        
        if (event.type === 'error') {
          errors.push({
            message: event.error?.message || 'Unknown error',
            line: 1,
            column: 1
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors,
        events: events
      };
    } catch (error) {
      console.error('Query validation error:', error);
      return {
        isValid: false,
        errors: [{
          message: `Validation error: ${error.message}`,
          line: 1,
          column: 1
        }],
        events: []
      };
    }
  }

  /**
   * Извлечение номера строки из сообщения об ошибке PostgreSQL
   */
  extractLineNumber(errorMessage) {
    const lineMatch = errorMessage.match(/LINE (\d+):/);
    return lineMatch ? parseInt(lineMatch[1], 10) : 1;
  }

  /**
   * Извлечение номера колонки из сообщения об ошибке PostgreSQL
   */
  extractColumnNumber(errorMessage) {
    // PostgreSQL иногда указывает позицию символа
    const posMatch = errorMessage.match(/at character (\d+)/);
    if (posMatch) {
      return parseInt(posMatch[1], 10);
    }
    
    // Или ищем указатель в следующей строке
    const lines = errorMessage.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].includes('LINE')) {
        const nextLine = lines[i + 1];
        const caretIndex = nextLine.indexOf('^');
        if (caretIndex !== -1) {
          return caretIndex + 1;
        }
      }
    }
    
    return 1;
  }

  /**
   * Выполнение запроса и получение результатов в виде таблицы
   */
  async executeQueryForResults(query, instanceId) {
    const runRequest = {
      instance_ref: instanceId,
      kind: 'psql',
      args: ['-c', query]
    };

    const results = {
      success: false,
      data: [],
      columns: [],
      errors: [],
      executionTime: 0
    };

    const startTime = Date.now();
    let stdoutBuffer = '';

    try {
      // Вызываем runQuery напрямую без await, чтобы обработать ошибки
      const queryPromise = this.runQuery(runRequest);
      
      for await (const event of await queryPromise) {
        if (event.type === 'stdout' && event.data) {
          stdoutBuffer += event.data;
        }
        
        if (event.type === 'stderr' && event.data) {
          results.errors.push(event.data);
        }
        
        if (event.type === 'exit') {
          results.executionTime = Date.now() - startTime;
          if (event.exit_code === 0) {
            results.success = true;
            // Парсим результат PostgreSQL
            const parsed = this.parsePostgreSQLOutput(stdoutBuffer);
            results.data = parsed.data;
            results.columns = parsed.columns;
          }
        }
        
        if (event.type === 'error') {
          // Extract detailed error information
          let errorMessage = event.error?.message || 'Unknown error';
          if (event.error?.details) {
            errorMessage = event.error.details;
          }
          results.errors.push({
            message: errorMessage,
            code: event.error?.code,
            details: event.error?.details,
            originalMessage: event.error?.message
          });
        }
      }
    } catch (error) {
      console.error('Execute query error caught:', error);
      results.executionTime = Date.now() - startTime;
      
      // Extract detailed error information from the caught error
      let errorInfo = { message: error.message };
      
      // Проверяем, есть ли данные бэкенда в error.backendData
      if (error.backendData) {
        console.log('Found backendData in error:', error.backendData);
        errorInfo = {
          message: error.backendData.details || error.backendData.message || error.message,
          code: error.backendData.code,
          details: error.backendData.details,
          originalMessage: error.backendData.message
        };
      } else {
        // Извлекаем детали из сообщения ошибки
        const errorMessage = error.message;
        console.log('Parsing error message:', errorMessage);
        if (errorMessage.includes('Failed to run query:')) {
          const detailsMatch = errorMessage.match(/Failed to run query:\s*(.+)/s);
          if (detailsMatch) {
            const details = detailsMatch[1];
            errorInfo = {
              message: details,
              details: details,
              originalMessage: errorMessage,
              code: 'execution_error'
            };
            console.log('Extracted error details:', errorInfo);
          }
        }
      }
      
      results.errors.push(errorInfo);
      console.log('Final results with error:', results);
    }

    return results;
  }

  /**
   * Парсинг вывода PostgreSQL в табличный формат
   */
  parsePostgreSQLOutput(output) {
    const lines = output.trim().split('\n');
    if (lines.length < 3) {
      return { columns: [], data: [] };
    }

    // Первая строка содержит заголовки колонок
    const headerLine = lines[0];
    const separatorLine = lines[1];
    
    // Определяем границы колонок по разделителю
    const columnBoundaries = [];
    let inColumn = false;
    
    for (let i = 0; i < separatorLine.length; i++) {
      const char = separatorLine[i];
      if (char === '-' && !inColumn) {
        columnBoundaries.push(i);
        inColumn = true;
      } else if (char !== '-' && inColumn) {
        columnBoundaries.push(i);
        inColumn = false;
      }
    }
    
    if (inColumn) {
      columnBoundaries.push(separatorLine.length);
    }

    // Извлекаем названия колонок
    const columns = [];
    for (let i = 0; i < columnBoundaries.length; i += 2) {
      const start = columnBoundaries[i];
      const end = columnBoundaries[i + 1] || headerLine.length;
      const columnName = headerLine.substring(start, end).trim();
      if (columnName) {
        columns.push(columnName);
      }
    }

    // Извлекаем данные
    const data = [];
    for (let lineIndex = 2; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      
      // Пропускаем строки с информацией о количестве записей
      if (line.match(/^\(\d+ rows?\)/) || line.trim() === '') {
        continue;
      }

      const row = {};
      for (let i = 0; i < columnBoundaries.length; i += 2) {
        const start = columnBoundaries[i];
        const end = columnBoundaries[i + 1] || line.length;
        const value = line.substring(start, end).trim();
        const columnIndex = i / 2;
        
        if (columnIndex < columns.length) {
          row[columns[columnIndex]] = value;
        }
      }
      
      // Добавляем строку только если она содержит данные
      if (Object.keys(row).length > 0 && Object.values(row).some(v => v !== '')) {
        data.push(row);
      }
    }

    return { columns, data };
  }

  /**
   * Создание и подготовка PostgreSQL инстанса
   */
  async createAndPreparePostgreSQLInstance() {
    try {
      console.log('Creating PostgreSQL prepare job...');
      
      // Создаем prepare job для PostgreSQL
      const prepareRequest = {
        prepare_kind: "psql",
        image_id: "postgres:15",
        psql_args: ["-c", "SELECT 1;"]
      };

      const prepareJob = await this.createPrepareJob(prepareRequest);
      console.log('Prepare job created:', prepareJob);

      if (!prepareJob.job_id) {
        throw new Error('Failed to create prepare job: no job ID returned');
      }

      // Ждем завершения подготовки
      console.log('Waiting for job completion...');
      const completedJob = await this.waitForJobCompletion(prepareJob.job_id);
      console.log('Job completed:', completedJob);

      if (!completedJob.result || !completedJob.result.instance_id) {
        throw new Error('Failed to get instance ID from completed job result');
      }

      // Даем инстансу немного времени для полной готовности
      console.log('Waiting for instance to be fully ready...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        instanceId: completedJob.result.instance_id,
        jobId: prepareJob.job_id,
        status: completedJob.status,
        dsn: completedJob.result.dsn
      };
    } catch (error) {
      console.error('Error creating PostgreSQL instance:', error);
      throw error;
    }
  }

  /**
   * Проверка готовности инстанса к работе
   */
  async testInstanceReadiness(instanceId, maxAttempts = 5) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Testing instance readiness, attempt ${attempt}/${maxAttempts}...`);
        
        const runRequest = {
          instance_ref: instanceId,
          kind: 'psql',
          args: ['-c', 'SELECT 1;']
        };

        // Пробуем выполнить простой запрос
        for await (const event of await this.runQuery(runRequest)) {
          if (event.type === 'exit' && event.exit_code === 0) {
            console.log('Instance is ready!');
            return true;
          }
          if (event.type === 'error') {
            throw new Error(event.error?.message || 'Test query failed');
          }
        }
        
        return true;
      } catch (error) {
        console.log(`Instance readiness test failed (attempt ${attempt}):`, error.message);
        
        if (attempt === maxAttempts) {
          throw new Error(`Instance not ready after ${maxAttempts} attempts: ${error.message}`);
        }
        
        // Ждем перед следующей попыткой
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Получение списка доступных инстансов
   */
  async getInstances() {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/instances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get instances: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get instances error:', error);
      throw error;
    }
  }

  /**
   * Проверка существования и готовности инстанса
   */
  async checkInstanceAvailability(instanceId) {
    try {
      const instances = await this.getInstances();
      const instance = instances.find(inst => inst.instance_id === instanceId);
      
      if (!instance) {
        return { available: false, reason: 'Instance not found' };
      }

      if (instance.status !== 'active') {
        return { available: false, reason: `Instance status: ${instance.status}` };
      }

      return { available: true, instance };
    } catch (error) {
      console.error('Check instance availability error:', error);
      return { available: false, reason: error.message };
    }
  }

  /**
   * Получение активного инстанса
   */
  async getActiveInstance() {
    try {
      const instances = await this.getInstances();
      const activeInstance = instances.find(inst => inst.status === 'active');
      
      if (activeInstance) {
        console.log('Found active instance:', activeInstance.instance_id);
        return activeInstance.instance_id;
      }
      
      console.log('No active instances found');
      return null;
    } catch (error) {
      console.error('Error getting active instance:', error);
      return null;
    }
  }

  /**
   * Автоматическая подготовка инстанса для выполнения запросов
   */
  async ensureInstanceReady() {
    try {
      // Сначала ищем любой активный инстанс
      const activeInstanceId = await this.getActiveInstance();
      if (activeInstanceId) {
        console.log('Using active instance:', activeInstanceId);
        this.config.instanceId = activeInstanceId;
        return activeInstanceId;
      }

      // Если нет активных инстансов, создаем новый
      console.log('No active instances found, creating new PostgreSQL instance...');
      const result = await this.createAndPreparePostgreSQLInstance();
      
      // Обновляем конфигурацию с новым instanceId
      this.config.instanceId = result.instanceId;
      
      return result.instanceId;
    } catch (error) {
      console.error('Error ensuring instance ready:', error);
      throw error;
    }
  }
}

// Экспорт типов для TypeScript-подобного использования
export const TaidonEventTypes = {
  START: 'start',
  STDOUT: 'stdout',
  STDERR: 'stderr',
  EXIT: 'exit',
  ERROR: 'error',
  LOG: 'log'
};

export const TaidonJobStatus = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
};

// Создание глобального экземпляра клиента
export const taidonClient = new TaidonApiClient();