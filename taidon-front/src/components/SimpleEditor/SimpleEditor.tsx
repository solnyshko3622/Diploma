import React, { useState, useEffect } from 'react';
import { parseSQL } from '../../utils/sql-parser';
import './simple-editor.css';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  height?: string;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
  value,
  onChange,
  onRun,
  height = '400px'
}) => {
  const [errors, setErrors] = useState<any[]>([]);
  const [highlightedCode, setHighlightedCode] = useState<string>('');

  useEffect(() => {
    // Парсим SQL и получаем ошибки
    const result = parseSQL(value);
    setErrors(result.errors);

    // Создаем подсвеченный HTML
    const highlighted = highlightSQLCode(value, result.tokens);
    setHighlightedCode(highlighted);
  }, [value]);

  const highlightSQLCode = (code: string, tokens: any[]) => {
    if (!tokens.length) return code;

    let highlighted = '';
    let lastIndex = 0;

    tokens.forEach(token => {
      // Добавляем текст до токена
      highlighted += escapeHtml(code.substring(lastIndex, token.start));
      
      // Добавляем токен с подсветкой
      const className = getTokenClassName(token.type);
      const tokenText = escapeHtml(code.substring(token.start, token.end));
      
      if (className) {
        highlighted += `<span class="${className}">${tokenText}</span>`;
      } else {
        highlighted += tokenText;
      }
      
      lastIndex = token.end;
    });

    // Добавляем оставшийся текст
    highlighted += escapeHtml(code.substring(lastIndex));
    
    return highlighted;
  };

  const getTokenClassName = (tokenType: string) => {
    switch (tokenType) {
      case 'keyword': return 'sql-keyword';
      case 'function': return 'sql-function';
      case 'string': return 'sql-string';
      case 'number': return 'sql-number';
      case 'comment': return 'sql-comment';
      case 'operator':
      case 'comparison': return 'sql-operator';
      case 'logical': return 'sql-logical';
      case 'identifier': return 'sql-identifier';
      case 'variable': return 'sql-variable';
      case 'boolean': return 'sql-boolean';
      case 'null': return 'sql-null';
      case 'error': return 'sql-error';
      default: return '';
    }
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onRun) onRun();
    }
  };

  return (
    <div className="simple-editor-container">
      <div className="simple-editor-toolbar">
        <div className="toolbar-left">
          {errors.length > 0 && (
            <div className="error-indicator">
              <span className="icon">⚠️</span>
              {errors.length} ошиб{errors.length === 1 ? 'ка' : errors.length < 5 ? 'ки' : 'ок'}
            </div>
          )}
        </div>
        <div className="toolbar-right">
          {onRun && (
            <button 
              className="toolbar-button run-button"
              onClick={onRun}
              title="Выполнить запрос (Ctrl+Enter)"
            >
              <span className="icon">▶️</span>
              Выполнить
            </button>
          )}
        </div>
      </div>
      
      <div className="simple-editor" style={{ height }}>
        <div className="editor-gutter">
          {value.split('\n').map((_, index) => (
            <div key={index} className="line-number">{index + 1}</div>
          ))}
        </div>
        
        <div className="editor-content">
          <textarea
            className="editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="Введите SQL запрос..."
          />
          <div 
            className="editor-highlight"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </div>
      </div>
      
      {errors.length > 0 && (
        <div className="error-list">
          {errors.slice(0, 3).map((error, index) => (
            <div key={index} className="error-item">
              <span className="error-severity">{error.severity}</span>
              <span className="error-message">{error.message}</span>
              <span className="error-location">строка {error.line}, колонка {error.column}</span>
            </div>
          ))}
          {errors.length > 3 && (
            <div className="error-more">и еще {errors.length - 3} ошиб{errors.length - 3 === 1 ? 'ка' : 'ки'}</div>
          )}
        </div>
      )}
      
      <div className="simple-editor-status">
        <span className="status-item">SQL</span>
        <span className="status-item">UTF-8</span>
        <span className="status-hint">Ctrl+Enter для выполнения</span>
      </div>
    </div>
  );
};

export default SimpleEditor;