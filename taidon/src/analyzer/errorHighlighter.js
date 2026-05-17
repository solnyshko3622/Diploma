import { Decoration, EditorView } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { SQLLexer } from './lexer.js';
import { SQLParser } from './parser.js';

// Эффект для обновления ошибок
export const updateErrors = StateEffect.define();

// Создание декорации для подчеркивания ошибок
const errorDecoration = Decoration.mark({
  class: 'cm-error-underline',
  attributes: { title: 'Синтаксическая ошибка' }
});

// Создание декорации для подсветки ошибочного токена
const errorTokenDecoration = Decoration.mark({
  class: 'cm-error-token',
  attributes: { title: 'Ошибочный токен' }
});

// StateField для хранения и отображения ошибок
export const errorHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  
  update(decorations, tr) {
    // Обновляем позиции существующих декораций при изменении документа
    decorations = decorations.map(tr.changes);
    
    // Проверяем эффекты обновления ошибок
    for (let effect of tr.effects) {
      if (effect.is(updateErrors)) {
        decorations = createErrorDecorations(effect.value, tr.state.doc);
      }
    }
    
    return decorations;
  },
  
  provide: f => EditorView.decorations.from(f)
});

// Функция создания декораций для ошибок
function createErrorDecorations(errors, doc) {
  const decorations = [];
  
  for (const error of errors) {
    try {
      // Вычисляем позицию ошибки в документе
      const line = Math.max(0, error.line - 1);
      
      if (line >= doc.lines) continue;
      
      const lineObj = doc.line(line + 1);
      const lineText = lineObj.text;
      
      let from, to;
      
      // Если есть целевое слово из PostgreSQL ошибки, ищем его
      if (error.targetWord && error.type === 'postgresql') {
        const wordIndex = lineText.indexOf(error.targetWord);
        if (wordIndex !== -1) {
          from = lineObj.from + wordIndex;
          to = from + error.targetWord.length;
        } else {
          // Fallback: используем позицию колонки
          const column = Math.max(0, error.column - 1);
          from = lineObj.from + Math.min(column, lineText.length);
          to = Math.min(from + Math.max(1, getTokenLength(doc, from, error)), lineObj.to);
        }
      } else {
        // Стандартная обработка для других типов ошибок
        const column = Math.max(0, error.column - 1);
        from = lineObj.from + Math.min(column, lineText.length);
        
        if (error.position !== undefined) {
          // Если есть информация о токене, подчеркиваем весь токен
          const tokenLength = getTokenLength(doc, from, error);
          to = Math.min(from + Math.max(1, tokenLength), lineObj.to);
        } else {
          // Подчеркиваем слово или токен на позиции
          const tokenLength = getTokenLength(doc, from, error);
          to = Math.min(from + Math.max(1, tokenLength), lineObj.to);
        }
      }
      
      // Создаем декорацию с информацией об ошибке
      const decoration = Decoration.mark({
        class: 'cm-error-underline',
        attributes: {
          title: error.message,
          'data-error-line': error.line,
          'data-error-column': error.column,
          'data-error-type': error.type || 'error'
        }
      });
      
      decorations.push(decoration.range(from, to));
    } catch (e) {
      console.warn('Ошибка при создании декорации:', e);
    }
  }
  
  return Decoration.set(decorations);
}

// Функция для определения длины токена
function getTokenLength(doc, position, error) {
  const text = doc.toString();
  let length = 1;
  
  // Пытаемся найти границы токена
  const char = text[position];
  if (!char) return 1;
  
  if (/[a-zA-Z_]/.test(char)) {
    // Идентификатор или ключевое слово
    while (position + length < text.length && 
           /[a-zA-Z0-9_]/.test(text[position + length])) {
      length++;
    }
  } else if (/\d/.test(char)) {
    // Число
    while (position + length < text.length && 
           /[\d.]/.test(text[position + length])) {
      length++;
    }
  } else if (char === '\'' || char === '"') {
    // Строка
    const quote = char;
    length = 1;
    while (position + length < text.length) {
      if (text[position + length] === quote) {
        length++;
        break;
      }
      if (text[position + length] === '\\') {
        length += 2; // Пропускаем escape-последовательность
      } else {
        length++;
      }
    }
  }
  
  return Math.max(1, length);
}

// Функция анализа кода и получения ошибок
export function analyzeCode(code) {
  const errors = [];
  
  try {
    // Лексический анализ
    const lexer = new SQLLexer(code);
    const tokens = lexer.tokenize();
    
    // Добавляем лексические ошибки
    const lexicalErrors = lexer.getErrors();
    errors.push(...lexicalErrors);
    
    // Синтаксический анализ
    const parser = new SQLParser(tokens);
    const ast = parser.parse();
    
    // Добавляем синтаксические ошибки
    const syntaxErrors = parser.getErrors();
    errors.push(...syntaxErrors);
    
    return {
      tokens,
      ast,
      errors,
      hasErrors: errors.length > 0
    };
  } catch (error) {
    console.error('Ошибка анализа:', error);
    return {
      tokens: [],
      ast: null,
      errors: [{
        message: 'Критическая ошибка анализа: ' + error.message,
        line: 1,
        column: 1,
        position: 0
      }],
      hasErrors: true
    };
  }
}

// Функция для парсинга ошибок PostgreSQL из бэкенда
export function parsePostgreSQLError(errorDetails) {
  console.log('parsePostgreSQLError called with:', errorDetails);
  const errors = [];
  
  if (!errorDetails) {
    console.log('No error details provided');
    return errors;
  }
  
  // Разбираем детали ошибки PostgreSQL
  const lines = errorDetails.split('\n');
  console.log('Split into lines:', lines);
  let currentError = null;
  let sqlLine = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`Processing line ${i}:`, line);
    
    // Ищем основную ошибку PostgreSQL
    if (line.includes('ERROR:')) {
      const errorMatch = line.match(/ERROR:\s*(.+)/);
      if (errorMatch) {
        currentError = {
          message: errorMatch[1].trim(),
          line: 1,
          column: 1,
          type: 'postgresql'
        };
        console.log('Found ERROR, created currentError:', currentError);
      }
    }
    
    // Ищем номер строки и SQL код
    if (line.includes('LINE ') && currentError) {
      const lineMatch = line.match(/LINE (\d+):\s*(.+)/);
      if (lineMatch) {
        currentError.line = parseInt(lineMatch[1], 10);
        sqlLine = lineMatch[2]; // SQL код из строки LINE
        currentError.sqlContext = sqlLine;
        console.log('Found LINE, updated currentError:', currentError);
        console.log('SQL line:', sqlLine);
      }
    }
    
    // Ищем указатель позиции (строка с ^)
    if (line.includes('^') && currentError) {
      const caretPosition = line.indexOf('^');
      console.log('Found caret at position:', caretPosition);
      
      if (caretPosition !== -1) {
        // Вычисляем точную позицию в SQL коде
        currentError.column = caretPosition + 1;
        
        // Если есть SQL контекст, находим точную позицию слова
        if (sqlLine) {
          console.log('Analyzing SQL line for target word:', sqlLine);
          // Ищем слово, на которое указывает каретка
          const words = sqlLine.split(/\s+/);
          console.log('Words in SQL line:', words);
          let currentPos = 0;
          let targetWord = '';
          
          for (const word of words) {
            const wordStart = sqlLine.indexOf(word, currentPos);
            const wordEnd = wordStart + word.length;
            console.log(`Word "${word}" at positions ${wordStart}-${wordEnd}, caret at ${caretPosition}`);
            
            if (caretPosition >= wordStart && caretPosition <= wordEnd) {
              targetWord = word;
              currentError.column = wordStart + 1;
              currentError.targetWord = targetWord;
              console.log('Found target word:', targetWord);
              break;
            }
            currentPos = wordEnd;
          }
        }
        
        console.log('Updated currentError with caret info:', currentError);
      }
    }
    
    // Если нашли полную ошибку, добавляем её
    if (currentError && (line.includes('^') || i === lines.length - 1)) {
      console.log('Adding error to results:', currentError);
      errors.push(currentError);
      currentError = null;
      sqlLine = null;
    }
  }
  
  // Если не удалось распарсить структурированно, создаем общую ошибку
  if (errors.length === 0 && errorDetails.includes('ERROR:')) {
    console.log('Fallback: creating simple error');
    const errorMatch = errorDetails.match(/ERROR:\s*(.+?)(?:\n|$)/);
    if (errorMatch) {
      errors.push({
        message: errorMatch[1].trim(),
        line: 1,
        column: 1,
        type: 'postgresql'
      });
    }
  }
  
  console.log('Final parsed errors:', errors);
  return errors;
}

// Функция для интеграции ошибок бэкенда с редактором
export function updateEditorWithBackendErrors(view, backendErrors) {
  console.log('updateEditorWithBackendErrors called with:', backendErrors);
  const parsedErrors = [];
  
  if (Array.isArray(backendErrors)) {
    for (const error of backendErrors) {
      console.log('Processing error:', error);
      
      if (typeof error === 'object' && error.details) {
        // Парсим детальные ошибки PostgreSQL
        console.log('Parsing PostgreSQL error details:', error.details);
        const postgresErrors = parsePostgreSQLError(error.details);
        console.log('Parsed PostgreSQL errors:', postgresErrors);
        parsedErrors.push(...postgresErrors);
      } else if (typeof error === 'object' && error.message) {
        // Простая ошибка без деталей
        console.log('Processing simple object error:', error.message);
        parsedErrors.push({
          message: error.message,
          line: 1,
          column: 1,
          type: 'backend'
        });
      } else if (typeof error === 'string') {
        // Строковая ошибка (legacy)
        console.log('Processing string error:', error);
        
        // Проверяем, содержит ли строка PostgreSQL ошибку
        if (error.includes('ERROR:') && error.includes('LINE')) {
          console.log('String contains PostgreSQL error, parsing...');
          const postgresErrors = parsePostgreSQLError(error);
          console.log('Parsed from string:', postgresErrors);
          parsedErrors.push(...postgresErrors);
        } else {
          parsedErrors.push({
            message: error,
            line: 1,
            column: 1,
            type: 'backend'
          });
        }
      }
    }
  }
  
  console.log('Final parsed errors for editor:', parsedErrors);
  
  // Отправляем ошибки в редактор
  if (parsedErrors.length > 0) {
    console.log('Dispatching errors to editor...');
    view.dispatch({
      effects: updateErrors.of(parsedErrors)
    });
  } else {
    console.log('No errors to dispatch');
  }
  
  return parsedErrors;
}

// Расширение CodeMirror для анализа SQL
export function sqlAnalyzer() {
  return [
    errorHighlightField,
    // Добавляем CSS стили для подсветки ошибок
    {
      key: 'sqlErrorStyles',
      value: `
        .cm-error-underline {
          text-decoration: underline;
          text-decoration-color: #ff0000;
          text-decoration-style: wavy;
          text-decoration-thickness: 2px;
          text-underline-offset: 2px;
        }
        
        .cm-error-token {
          background-color: rgba(255, 0, 0, 0.1);
          border-radius: 2px;
        }
        
        .cm-editor .cm-error-underline:hover {
          background-color: rgba(255, 0, 0, 0.05);
        }
      `
    }
  ];
}

// Функция для обновления ошибок в редакторе
export function updateEditorErrors(view, code) {
  const analysis = analyzeCode(code);
  
  // Отправляем эффект обновления ошибок
  view.dispatch({
    effects: updateErrors.of(analysis.errors)
  });
  
  return analysis;
}

// Debounced версия анализа для производительности
export function createDebouncedAnalyzer(callback, delay = 500) {
  let timeoutId;
  
  return function(code) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(code);
    }, delay);
  };
}