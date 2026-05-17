# 🚀 Руководство по запуску Taidon

Это подробное руководство поможет вам быстро запустить проект Taidon на вашем компьютере для разработки или тестирования.

## 📋 Содержание

1. [Системные требования](#системные-требования)
2. [Установка зависимостей](#установка-зависимостей)
3. [Настройка проекта](#настройка-проекта)
4. [Запуск в режиме разработки](#запуск-в-режиме-разработки)
5. [Запуск с бэкендом](#запуск-с-бэкендом)
6. [Сборка для продакшена](#сборка-для-продакшена)
7. [Решение проблем](#решение-проблем)
8. [Полезные команды](#полезные-команды)

## 🖥️ Системные требования

### Минимальные требования
- **Операционная система**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: версия 16.0.0 или выше
- **npm**: версия 7.0.0 или выше (поставляется с Node.js)
- **Оперативная память**: минимум 4 ГБ
- **Свободное место**: минимум 1 ГБ

### Рекомендуемые требования
- **Node.js**: версия 18.0.0 или выше
- **npm**: версия 8.0.0 или выше
- **Оперативная память**: 8 ГБ или больше
- **SSD**: для быстрой работы

### Проверка версий
```bash
# Проверить версию Node.js
node --version

# Проверить версию npm
npm --version

# Проверить версию Git
git --version
```

## 📦 Установка зависимостей

### 1. Установка Node.js

#### Windows
1. Скачайте установщик с [nodejs.org](https://nodejs.org/)
2. Запустите установщик и следуйте инструкциям
3. Перезапустите командную строку

#### macOS
```bash
# Используя Homebrew (рекомендуется)
brew install node

# Или скачайте установщик с nodejs.org
```

#### Ubuntu/Debian
```bash
# Обновить список пакетов
sudo apt update

# Установить Node.js и npm
sudo apt install nodejs npm

# Или использовать NodeSource репозиторий для последней версии
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Установка Git
```bash
# Windows (через Chocolatey)
choco install git

# macOS (через Homebrew)
brew install git

# Ubuntu/Debian
sudo apt install git
```

## 🔧 Настройка проекта

### 1. Клонирование репозитория
```bash
# Клонировать репозиторий
git clone https://github.com/your-username/taidon.git

# Перейти в папку проекта
cd taidon

# Проверить содержимое папки
ls -la
```

### 2. Установка зависимостей проекта
```bash
# Установить все зависимости
npm install

# Или использовать yarn (если установлен)
yarn install
```

**Ожидаемый результат:**
```
added 1234 packages, and audited 1235 packages in 45s
found 0 vulnerabilities
```

### 3. Проверка установки
```bash
# Проверить установленные пакеты
npm list --depth=0

# Проверить наличие основных зависимостей
npm list react react-dom webpack
```

## ⚙️ Настройка конфигурации

### 1. Настройка API подключения

Откройте файл [`src/api/backendClient.js`](src/api/backendClient.js) и настройте параметры:

```javascript
// Для работы с реальным бэкендом
const API_BASE_URL = 'http://localhost:8000';
const USE_MOCK_MODE = false;

// Для работы в демо режиме (без бэкенда)
const API_BASE_URL = 'http://localhost:8000';
const USE_MOCK_MODE = true;
```

### 2. Создание файла переменных окружения (опционально)

Создайте файл `.env` в корне проекта:

```env
# .env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

### 3. Настройка портов

По умолчанию фронтенд запускается на порту 3000. Для изменения порта:

```bash
# Временно для одного запуска
PORT=3001 npm start

# Или добавить в .env файл
echo "PORT=3001" >> .env
```

## 🚀 Запуск в режиме разработки

### 1. Базовый запуск
```bash
# Запустить сервер разработки
npm start

# Альтернативная команда
npm run start
```

**Ожидаемый вывод:**
```
Compiled successfully!

You can now view sql-editor in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled with 1 warning
```

### 2. Открытие в браузере
- Автоматически откроется браузер с адресом http://localhost:3000
- Если не открылся, перейдите по ссылке вручную

### 3. Проверка работоспособности
1. **Страница загрузилась** - вы видите интерфейс Taidon
2. **Нет ошибок в консоли** - откройте Developer Tools (F12)
3. **Mock режим работает** - можете создавать проекты и скрипты

### 4. Hot Reload
При изменении файлов страница автоматически перезагружается:
- Измените любой файл в папке `src/`
- Сохраните изменения
- Браузер автоматически обновится

## 🔗 Запуск с бэкендом

### 1. Подготовка бэкенда

Если у вас есть бэкенд Taidon:

```bash
# Перейти в папку бэкенда (предполагается, что она рядом)
cd ../taidon-backend

# Создать виртуальное окружение Python
python3 -m venv venv

# Активировать окружение
# На Windows:
venv\Scripts\activate
# На macOS/Linux:
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Запустить бэкенд
python run.py
```

### 2. Настройка фронтенда для работы с бэкендом

В файле [`src/api/backendClient.js`](src/api/backendClient.js):

```javascript
const API_BASE_URL = 'http://localhost:8000';
const USE_MOCK_MODE = false; // Отключить mock режим
```

### 3. Запуск фронтенда
```bash
# Вернуться в папку фронтенда
cd ../taidon

# Запустить фронтенд
npm start
```

### 4. Проверка интеграции
1. Откройте http://localhost:3000
2. Попробуйте зарегистрироваться
3. Создайте проект
4. Добавьте скрипт
5. Проверьте автосохранение

## 📦 Сборка для продакшена

### 1. Создание production сборки
```bash
# Создать оптимизированную сборку
npm run build
```

**Ожидаемый результат:**
```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  45.2 KB  build/static/js/main.abc123.js
  15.3 KB  build/static/css/main.def456.css

The project was built assuming it is hosted at the server root.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.
```

### 2. Проверка сборки
```bash
# Установить serve для локального тестирования
npm install -g serve

# Запустить production сборку локально
serve -s build

# Или использовать npx
npx serve -s build
```

### 3. Структура сборки
```
build/
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   ├── js/
│   │   └── main.[hash].js
│   └── media/
├── index.html
└── manifest.json
```

## 🔧 Решение проблем

### Проблема: "npm command not found"
**Решение:**
```bash
# Переустановить Node.js с официального сайта
# Или проверить PATH переменную
echo $PATH
```

### Проблема: "Permission denied" при установке пакетов
**Решение для macOS/Linux:**
```bash
# Изменить владельца папки npm
sudo chown -R $(whoami) ~/.npm

# Или использовать nvm для управления версиями Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

### Проблема: "Port 3000 is already in use"
**Решение:**
```bash
# Найти процесс, использующий порт
lsof -ti:3000

# Завершить процесс
kill -9 $(lsof -ti:3000)

# Или использовать другой порт
PORT=3001 npm start
```

### Проблема: "Module not found" ошибки
**Решение:**
```bash
# Очистить кэш npm
npm cache clean --force

# Удалить node_modules и переустановить
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Медленная работа на Windows
**Решение:**
```bash
# Добавить исключения в Windows Defender
# Исключить папки: node_modules, build, .git

# Или использовать WSL2 для лучшей производительности
```

### Проблема: CORS ошибки при подключении к API
**Решение:**
1. Убедитесь, что бэкенд запущен на порту 8000
2. Проверьте настройки CORS в бэкенде
3. Используйте прокси в webpack.config.js:

```javascript
// webpack.config.js
module.exports = {
  // ... другие настройки
  devServer: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
};
```

## 📝 Полезные команды

### Разработка
```bash
# Запуск с подробным выводом
npm start -- --verbose

# Запуск на определенном порту
PORT=3001 npm start

# Запуск с открытием в определенном браузере
BROWSER=firefox npm start

# Запуск без автоматического открытия браузера
BROWSER=none npm start
```

### Отладка
```bash
# Проверка зависимостей на уязвимости
npm audit

# Исправление уязвимостей
npm audit fix

# Анализ размера бандла
npm install -g webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### Очистка
```bash
# Очистка кэша npm
npm cache clean --force

# Очистка node_modules
rm -rf node_modules package-lock.json
npm install

# Очистка build папки
rm -rf build
```

### Обновление зависимостей
```bash
# Проверить устаревшие пакеты
npm outdated

# Обновить все пакеты
npm update

# Обновить конкретный пакет
npm install package-name@latest
```

## 🌐 Настройка для разных окружений

### Development
```bash
# .env.development
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
```

### Production
```bash
# .env.production
REACT_APP_API_URL=https://api.taidon.com
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
```

### Testing
```bash
# .env.test
REACT_APP_API_URL=http://localhost:8001
REACT_APP_ENVIRONMENT=test
REACT_APP_DEBUG=true
```

## 🐳 Docker (опционально)

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

### Запуск с Docker
```bash
# Собрать образ
docker build -t taidon-frontend .

# Запустить контейнер
docker run -p 3000:3000 taidon-frontend
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:8000
    depends_on:
      - backend
  
  backend:
    image: taidon-backend
    ports:
      - "8000:8000"
```

## 📚 Дополнительные ресурсы

### Документация
- [React Documentation](https://reactjs.org/docs)
- [CodeMirror 6 Guide](https://codemirror.net/docs/)
- [Webpack Documentation](https://webpack.js.org/concepts/)

### Инструменты разработки
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

### Полезные расширения VS Code
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

---

## 🆘 Получение помощи

Если у вас возникли проблемы:

1. **Проверьте FAQ** в основном README.md
2. **Поищите в Issues** на GitHub
3. **Создайте новый Issue** с подробным описанием проблемы
4. **Обратитесь к сообществу** в Discord/Telegram

**Удачного использования Taidon! 🚀**