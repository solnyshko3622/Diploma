# Интеграция фронтенда с бэкендом Taidon

## Обзор интеграции

Фронтенд Taidon теперь полностью интегрирован с бэкендом API для управления пользователями, проектами и скриптами. Все данные синхронизируются с сервером в реальном времени.

## Архитектура интеграции

### API клиент
- **Файл**: [`src/api/backendClient.js`](src/api/backendClient.js)
- **Функции**: HTTP запросы, аутентификация, обработка ошибок
- **Базовый URL**: `http://localhost:8000`

### Аутентификация
- **JWT токены** сохраняются в localStorage
- **Автоматическая проверка** токена при загрузке приложения
- **Обновление контекста** пользователя при входе/выходе

### Управление состоянием
- **React Context** для глобального состояния пользователя
- **Локальное состояние** для проектов и скриптов
- **Автосохранение** изменений в скриптах

## Основные компоненты

### 1. AuthContext
**Файл**: [`src/contexts/AuthContext.js`](src/contexts/AuthContext.js)

**Функции**:
- `register(userData)` - регистрация пользователя
- `login(credentials)` - вход пользователя
- `logout()` - выход пользователя
- `updateProfile(updates)` - обновление профиля

**Интеграция с бэкендом**:
```javascript
// Регистрация
const newUser = await backendClient.register({
  email: userData.email,
  username: userData.username,
  full_name: userData.name,
  password: userData.password
});

// Вход
await backendClient.login(username, password);
const userData = await backendClient.getCurrentUser();
```

### 2. ProjectsPage
**Файл**: [`src/components/ProjectsPage.js`](src/components/ProjectsPage.js)

**Функции**:
- Загрузка проектов пользователя
- Создание новых проектов
- Отображение состояний загрузки и ошибок

**Интеграция с бэкендом**:
```javascript
// Загрузка проектов
const projectsData = await backendClient.getProjects();
setProjects(projectsData.owned_projects || []);
setSharedProjects(projectsData.shared_projects || []);

// Создание проекта
const newProject = await backendClient.createProject({
  name: 'Новый проект',
  description: 'Описание',
  is_public: false
});
```

### 3. App.js - Управление проектами и скриптами
**Файл**: [`src/App.js`](src/App.js)

**Функции**:
- Открытие проектов с загрузкой скриптов
- Создание и удаление скриптов
- Автосохранение изменений
- Переименование скриптов

**Интеграция с бэкендом**:
```javascript
// Загрузка скриптов проекта
const projectScripts = await backendClient.getProjectScripts(project.id);

// Создание скрипта
const newScript = await backendClient.createScript(project.id, {
  name: 'Новый скрипт',
  content: 'SELECT * FROM table;'
});

// Автосохранение
await backendClient.updateScript(scriptId, { content: newContent });

// Удаление скрипта
await backendClient.deleteScript(scriptId);
```

## API Endpoints

### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `GET /auth/me` - Текущий пользователь
- `PUT /auth/me` - Обновление профиля

### Проекты
- `GET /projects/` - Список проектов
- `POST /projects/` - Создание проекта
- `GET /projects/{id}` - Получение проекта
- `PUT /projects/{id}` - Обновление проекта
- `DELETE /projects/{id}` - Удаление проекта
- `POST /projects/{id}/copy` - Копирование проекта

### Скрипты
- `GET /scripts/project/{project_id}` - Скрипты проекта
- `POST /scripts/?project_id={id}` - Создание скрипта
- `GET /scripts/{id}` - Получение скрипта
- `PUT /scripts/{id}` - Обновление скрипта
- `DELETE /scripts/{id}` - Удаление скрипта

### Права доступа
- `GET /projects/{id}/permissions` - Список разрешений
- `POST /projects/{id}/permissions` - Предоставление доступа
- `PUT /projects/{id}/permissions/{user_id}` - Изменение доступа
- `DELETE /projects/{id}/permissions/{user_id}` - Удаление доступа

## Обработка ошибок

### Стратегии обработки
1. **Graceful degradation** - при ошибках API приложение продолжает работать с локальными данными
2. **Уведомления пользователя** - показ ошибок через UI
3. **Повторные попытки** - автоматические повторы для критических операций
4. **Fallback данные** - использование кэшированных данных при недоступности сервера

### Примеры обработки
```javascript
try {
  const result = await backendClient.createProject(projectData);
  return result;
} catch (error) {
  console.error('Error creating project:', error);
  setError('Не удалось создать проект');
  // Fallback к локальному созданию
  return createLocalProject(projectData);
}
```

## Состояния загрузки

### Индикаторы загрузки
- **Спиннер** для загрузки проектов
- **Состояние кнопок** при создании/удалении
- **Автосохранение** с индикацией статуса

### Пустые состояния
- **Нет проектов** - приглашение создать первый проект
- **Ошибка загрузки** - кнопка повторной попытки
- **Нет доступа** - предложение войти в систему

## Автосохранение

### Механизм
- **Debounced сохранение** - задержка 2 секунды после остановки печати
- **Только изменения** - сохранение только при реальных изменениях контента
- **Фоновое выполнение** - без блокировки UI

### Реализация
```javascript
// Автосохранение с задержкой
clearTimeout(window.autoSaveTimeout);
window.autoSaveTimeout = setTimeout(async () => {
  try {
    await backendClient.updateScript(scriptId, { content: newContent });
    console.log('Script auto-saved');
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}, 2000);
```

## Безопасность

### JWT токены
- **Автоматическое добавление** в заголовки запросов
- **Обновление при входе** и очистка при выходе
- **Проверка валидности** при каждом запросе

### Обработка истечения токенов
```javascript
if (!response.ok) {
  if (response.status === 401) {
    // Токен истёк, перенаправляем на вход
    backendClient.logout();
    setUser(null);
  }
  throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
}
```

## Запуск и тестирование

### Запуск бэкенда
```bash
cd taidon-backend
python3 -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
python run.py
```

### Запуск фронтенда
```bash
cd taidon
npm start
```

### Тестирование интеграции
1. **Регистрация** нового пользователя
2. **Создание проекта** и проверка сохранения
3. **Добавление скриптов** и автосохранение
4. **Совместная работа** - предоставление доступа
5. **Копирование проектов**

## Возможные проблемы и решения

### CORS ошибки
**Проблема**: Браузер блокирует запросы к API
**Решение**: Настроить CORS в бэкенде (уже настроено для localhost:3000)

### Ошибки подключения
**Проблема**: Фронтенд не может подключиться к бэкенду
**Решение**: 
1. Проверить, что бэкенд запущен на порту 8000
2. Проверить URL в `backendClient.js`
3. Проверить настройки прокси в webpack

### Проблемы с токенами
**Проблема**: Пользователь постоянно разлогинивается
**Решение**:
1. Проверить время жизни токенов в бэкенде
2. Реализовать обновление токенов
3. Проверить корректность сохранения в localStorage

## Дальнейшее развитие

### Планируемые улучшения
1. **Offline режим** - работа без интернета с синхронизацией
2. **Real-time обновления** - WebSocket для совместной работы
3. **Кэширование** - улучшение производительности
4. **Пагинация** - для больших списков проектов
5. **Поиск и фильтрация** - быстрый поиск по проектам и скриптам

### Оптимизации
1. **Lazy loading** - загрузка данных по требованию
2. **Мемоизация** - кэширование результатов запросов
3. **Batch операции** - группировка множественных изменений
4. **Оптимистичные обновления** - мгновенный отклик UI