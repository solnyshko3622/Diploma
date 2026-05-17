import { Decoration, EditorView } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { SQLLexer } from './lexer.js';
import { SQLParser } from './parser.js';
import { taidonClient } from '../api/taidonClient.js';

// Эффект для обновления ошибок
export const updateErrors = StateEffect.define();

// StateField для хранения и отображения ошибок
export const errorHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    
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
  console.log('createErrorDecorations called with errors:', errors);
  const decorations = [];
  
  for (const error of errors) {
    try {
      // Вычисляем позицию ошибки в документе
      const line = Math.max(0, error.line - 1);
      
      if (line >= doc.lines) {
        console.log('Line out of bounds:', line, 'doc.lines:', doc.lines);
        continue;
      }
      
      const lineObj = doc.line(line + 1);
      const lineText = lineObj.text;
      console.log('Processing error on line:', line + 1, 'text:', lineText);
      
      let from, to;
      
      // Если есть целевое слово из PostgreSQL ошибки, ищем его
      if (error.targetWord && error.type === 'postgresql') {
        const wordIndex = lineText.indexOf(error.targetWord);
        if (wordIndex !== -1) {
          from = lineObj.from + wordIndex;
          to = from + error.targetWord.length;
          console.log('Found target word:', error.targetWord, 'at positions:', from, '-', to);
        } else {
          // Fallback: используем позицию колонки
          const column = Math.max(0, error.column - 1);
          from = lineObj.from + Math.min(column, lineText.length);
          to = Math.min(from + Math.max(1, getTokenLength(doc, from, error)), lineObj.to);
          console.log('Fallback positioning for target word, from:', from, 'to:', to);
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
        console.log('Standard positioning, column:', error.column, 'from:', from, 'to:', to);
      }
      
      // Определяем класс в зависимости от типа ошибки
      const cssClass = error.type === 'warning' ? 'cm-warning-underline' : 'cm-error-underline';
      console.log('Creating decoration with class:', cssClass, 'from:', from, 'to:', to);
      
      const decoration = Decoration.mark({
        class: cssClass,
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
  
  console.log('Created decorations:', decorations.length);
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

// Простая функция анализа (локальная) с оптимизациями
export function analyzeCode(code, lightweight = false) {
  console.log('analyzeCode called with:', code.substring(0, 50) + '...', 'lightweight:', lightweight);
  const errors = [];
  
  try {
    if (!code || !code.trim()) {
      console.log('Empty code, returning no errors');
      return { errors: [], hasErrors: false };
    }
    
    // Добавляем простую проверку на опечатки в ключевых словах
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Проверяем на распространенные опечатки
        if (line.match(/\bSELCT\b/i)) {
          console.log('Found SELCT typo on line:', i + 1, 'content:', line);
          errors.push({
            message: 'Опечатка в ключевом слове: SELCT должно быть SELECT',
            line: i + 1,
            column: line.search(/SELCT/i) + 1,
            type: 'syntax'
          });
        }
        if (line.match(/\bFROM\s*$/i)) {
          errors.push({
            message: 'Отсутствует имя таблицы после FROM',
            line: i + 1,
            column: line.length,
            type: 'syntax'
          });
        }
      }
    }
    
    // Для очень длинного кода используем упрощенный анализ
    if (code.length > 5000 && lightweight) {
      console.log('Using lightweight analysis for long code');
      return analyzeLightweight(code);
    }
    
    // Лексический анализ
    const lexer = new SQLLexer(code);
    const tokens = lexer.tokenize();
    const lexicalErrors = lexer.getErrors();
    console.log('Lexical errors:', lexicalErrors);
    
    errors.push(...lexicalErrors);
    
    // Синтаксический анализ только если нет критических лексических ошибок
    if (lightweight && lexicalErrors.length > 5) {
      return {
        tokens,
        errors: lexicalErrors.slice(0, 5), // Ограничиваем количество ошибок
        hasErrors: true,
        isLightweight: true
      };
    }
    
    // Синтаксический анализ
    try {
      const parser = new SQLParser(tokens);
      const ast = parser.parse();
      const syntaxErrors = parser.getErrors();
      
      errors.push(...syntaxErrors);
    } catch (parseError) {
      console.warn('Ошибка парсинга:', parseError);
      errors.push({
        message: 'Синтаксическая ошибка: ' + parseError.message,
        line: 1,
        column: 1,
        type: 'syntax'
      });
    }
    
    return {
      tokens,
      errors: errors.slice(0, 10), // Ограничиваем количество ошибок
      hasErrors: errors.length > 0,
      isLightweight: lightweight
    };
  } catch (error) {
    console.error('Ошибка анализа:', error);
    return {
      errors: [{
        message: 'Ошибка анализа: ' + error.message,
        line: 1,
        column: 1,
        type: 'critical'
      }],
      hasErrors: true
    };
  }
}

// Упрощенный анализ для больших файлов
function analyzeLightweight(code) {
  const errors = [];
  const lines = code.split('\n');
  
  // Простая проверка на базовые ошибки
  for (let i = 0; i < Math.min(lines.length, 50); i++) { // Проверяем только первые 50 строк
    const line = lines[i];
    const lineNum = i + 1;
    
    // Проверка на незакрытые кавычки
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      errors.push({
        message: 'Незакрытая одинарная кавычка',
        line: lineNum,
        column: line.lastIndexOf("'") + 1,
        type: 'syntax'
      });
    }
    
    if (doubleQuotes % 2 !== 0) {
      errors.push({
        message: 'Незакрытая двойная кавычка',
        line: lineNum,
        column: line.lastIndexOf('"') + 1,
        type: 'syntax'
      });
    }
  }
  
  return {
    errors: errors.slice(0, 5),
    hasErrors: errors.length > 0,
    isLightweight: true
  };
}

// Функция анализа с бэкенд валидацией
export async function analyzeCodeWithBackend(code, instanceId = null) {
  // Сначала выполняем локальный анализ
  const localAnalysis = analyzeCode(code);
  
  // Если есть критические локальные ошибки, не отправляем на бэкенд
  if (localAnalysis.hasErrors && localAnalysis.errors.some(e => e.message.includes('Синтаксическая ошибка'))) {
    return localAnalysis;
  }
  
  try {
    // Выполняем бэкенд валидацию
    const backendValidation = await taidonClient.validateQuery(code, instanceId);
    
    // Объединяем локальные и бэкенд ошибки
    const allErrors = [...localAnalysis.errors, ...backendValidation.errors];
    
    return {
      ...localAnalysis,
      errors: allErrors,
      hasErrors: allErrors.length > 0,
      backendValidation: backendValidation,
      isBackendValidated: true
    };
  } catch (error) {
    console.warn('Ошибка бэкенд валидации:', error);
    
    // Если бэкенд недоступен, возвращаем только локальный анализ с предупреждением
    return {
      ...localAnalysis,
      errors: [
        ...localAnalysis.errors,
        {
          message: 'Предупреждение: Бэкенд валидация недоступна',
          line: 1,
          column: 1,
          type: 'warning'
        }
      ],
      hasErrors: localAnalysis.hasErrors,
      isBackendValidated: false,
      backendError: error.message
    };
  }
}

// Проверка доступности бэкенда
export async function checkBackendAvailability() {
  try {
    await taidonClient.healthCheck();
    return true;
  } catch (error) {
    console.warn('Бэкенд недоступен:', error);
    return false;
  }
}

// Расширение CodeMirror
export function sqlAnalyzer() {
  console.log('sqlAnalyzer extension being created');
  return [
    errorHighlightField,
    // Добавляем базовые стили для подсветки ошибок
    EditorView.baseTheme({
      '.cm-error-underline': {
        textDecoration: 'underline wavy #dc3545',
        textUnderlineOffset: '2px',
        textDecorationThickness: '2px'
      },
      '.cm-warning-underline': {
        textDecoration: 'underline wavy #ffc107',
        textUnderlineOffset: '2px',
        textDecorationThickness: '2px'
      },
      '.cm-error-token': {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderRadius: '2px'
      }
    })
  ];
}

// Функция для обновления ошибок в редакторе
export function updateEditorErrors(view, code) {
  console.log('updateEditorErrors called with code:', code.substring(0, 50) + '...');
  const analysis = analyzeCode(code, true); // Используем lightweight режим
  console.log('Analysis result:', analysis);
  console.log('Errors found:', analysis.errors);
  
  if (analysis.errors && analysis.errors.length > 0) {
    console.log('Dispatching errors to editor:', analysis.errors);
    view.dispatch({
      effects: updateErrors.of(analysis.errors)
    });
  } else {
    console.log('No errors to dispatch, clearing existing errors');
    // Очищаем существующие ошибки если их нет
    view.dispatch({
      effects: updateErrors.of([])
    });
  }
  
  return analysis;
}

// Функция для обновления ошибок в редакторе с результатами бэкенд анализа
export function updateEditorErrorsWithBackend(view, analysisResults) {
  view.dispatch({
    effects: updateErrors.of(analysisResults.errors)
  });
  
  return analysisResults;
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

// Debounced анализ с оптимизациями
export function createDebouncedAnalyzer(callback, delay = 3000) {
  let timeoutId;
  let lastCode = '';
  let isAnalyzing = false;
  
  return function(code) {
    // Пропускаем анализ если код не изменился
    if (code === lastCode) {
      return;
    }
    
    // Пропускаем анализ если предыдущий еще выполняется
    if (isAnalyzing) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!isAnalyzing) {
          lastCode = code;
          isAnalyzing = true;
          callback(code).finally(() => {
            isAnalyzing = false;
          });
        }
      }, delay);
      return;
    }
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      lastCode = code;
      isAnalyzing = true;
      callback(code).finally(() => {
        isAnalyzing = false;
      });
    }, delay);
  };
}