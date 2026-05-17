# 📚 Индекс документации Taidon

Добро пожаловать в центральный индекс документации проекта Taidon. Здесь вы найдете ссылки на всю доступную документацию, организованную по категориям.

## 🎯 Быстрый старт

### Для новых пользователей
1. **[README.md](README.md)** - Основная документация проекта
2. **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** - Подробное руководство по запуску
3. **[openapi.yaml](openapi.yaml)** - API спецификация

### Для разработчиков
1. **[FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)** - Интеграция фронтенда с бэкендом
2. **[frontend-integration-guide.md](frontend-integration-guide.md)** - Руководство по интеграции
3. **[use-case-diagram.md](use-case-diagram.md)** - Диаграммы использования

## 📖 Основная документация

### 🏠 Главная документация
| Файл | Описание | Аудитория |
|------|----------|-----------|
| **[README.md](README.md)** | Основная документация проекта с обзором возможностей, архитектуры и инструкций по установке | Все пользователи |
| **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** | Подробное пошаговое руководство по запуску проекта | Новые разработчики |

### 🔌 API и интеграция
| Файл | Описание | Аудитория |
|------|----------|-----------|
| **[openapi.yaml](openapi.yaml)** | Полная OpenAPI 3.0 спецификация REST API | Backend разработчики |
| **[FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)** | Детальное описание интеграции фронтенда с бэкендом | Fullstack разработчики |
| **[frontend-integration-guide.md](frontend-integration-guide.md)** | Руководство по интеграции компонентов | Frontend разработчики |

### 📊 Архитектура и дизайн
| Файл | Описание | Аудитория |
|------|----------|-----------|
| **[use-case-diagram.md](use-case-diagram.md)** | Диаграммы вариантов использования | Аналитики, архитекторы |
| **[sql-editor-use-case-diagram.drawio](sql-editor-use-case-diagram.drawio)** | Диаграмма в формате Draw.io | Дизайнеры |

## 🛠️ Техническая документация

### Конфигурация проекта
- **[package.json](package.json)** - Зависимости и скрипты npm
- **[webpack.config.js](webpack.config.js)** - Конфигурация сборки Webpack

### Структура кода
```
src/
├── components/          # React компоненты
├── contexts/           # React контексты
├── api/               # API клиенты
├── analyzer/          # SQL анализатор
├── themes/            # Темы оформления
└── styles.css         # Глобальные стили
```

## 🎯 Руководства по использованию

### 🚀 Быстрый старт
1. **Установка**: Следуйте инструкциям в [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
2. **Первый запуск**: `npm install && npm start`
3. **Открытие**: http://localhost:3000

### 🔧 Разработка
1. **API интеграция**: См. [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
2. **Компоненты**: См. [frontend-integration-guide.md](frontend-integration-guide.md)
3. **API документация**: См. [openapi.yaml](openapi.yaml)

## 📋 Чек-лист документации

### ✅ Созданная документация
- [x] **README.md** - Основная документация проекта
- [x] **STARTUP_GUIDE.md** - Руководство по запуску
- [x] **openapi.yaml** - OpenAPI спецификация
- [x] **DOCUMENTATION_INDEX.md** - Этот индекс

### ✅ Существующая документация
- [x] **FRONTEND_BACKEND_INTEGRATION.md** - Интеграция фронтенда с бэкендом
- [x] **frontend-integration-guide.md** - Руководство по интеграции
- [x] **use-case-diagram.md** - Диаграммы использования

## 🎨 Особенности документации

### README.md
- **Объем**: ~500 строк
- **Содержание**: Полный обзор проекта, архитектура, API, установка, развертывание
- **Особенности**: 
  - Эмодзи для улучшения читаемости
  - Подробные примеры кода
  - Ссылки на файлы проекта
  - FAQ и troubleshooting
  - Информация о лицензии и контрибуции

### STARTUP_GUIDE.md
- **Объем**: ~400 строк
- **Содержание**: Пошаговые инструкции по установке и запуску
- **Особенности**:
  - Системные требования
  - Решение типичных проблем
  - Команды для разных ОС
  - Docker инструкции
  - Настройка окружений

### openapi.yaml
- **Объем**: ~800 строк
- **Содержание**: Полная API спецификация
- **Особенности**:
  - OpenAPI 3.0 стандарт
  - Подробные схемы данных
  - Примеры запросов и ответов
  - Описания ошибок
  - Теги и группировка эндпоинтов

## 🔍 Поиск по документации

### По типу информации
- **Установка и запуск**: [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
- **API эндпоинты**: [openapi.yaml](openapi.yaml)
- **Архитектура**: [README.md](README.md) + [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
- **Компоненты**: [frontend-integration-guide.md](frontend-integration-guide.md)
- **Диаграммы**: [use-case-diagram.md](use-case-diagram.md)

### По аудитории
- **Новички**: [README.md](README.md) → [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
- **Frontend разработчики**: [frontend-integration-guide.md](frontend-integration-guide.md)
- **Backend разработчики**: [openapi.yaml](openapi.yaml)
- **Fullstack разработчики**: [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
- **DevOps**: [STARTUP_GUIDE.md](STARTUP_GUIDE.md) (секция Docker)

## 📊 Статистика документации

| Тип документа | Количество | Общий объем |
|---------------|------------|-------------|
| Markdown файлы | 6 | ~1500 строк |
| YAML спецификации | 1 | ~800 строк |
| Диаграммы | 1 | 1 файл |
| **Итого** | **8** | **~2300 строк** |

## 🔄 Обновление документации

### Процесс обновления
1. **Изменения в коде** → Обновить соответствующую документацию
2. **Новые API** → Обновить [openapi.yaml](openapi.yaml)
3. **Новые компоненты** → Обновить [frontend-integration-guide.md](frontend-integration-guide.md)
4. **Изменения в установке** → Обновить [STARTUP_GUIDE.md](STARTUP_GUIDE.md)

### Ответственность
- **README.md**: Ведущий разработчик
- **API документация**: Backend команда
- **Frontend гайды**: Frontend команда
- **Диаграммы**: Архитектор проекта

## 📞 Поддержка документации

### Обратная связь
- **GitHub Issues**: Для сообщений об ошибках в документации
- **Pull Requests**: Для предложения улучшений
- **Email**: support@taidon.com для общих вопросов

### Контрибуция
1. Fork репозитория
2. Создайте ветку для изменений документации
3. Внесите изменения
4. Создайте Pull Request

---

**Последнее обновление**: 17 мая 2026  
**Версия документации**: 1.0.0  
**Статус**: ✅ Актуальная