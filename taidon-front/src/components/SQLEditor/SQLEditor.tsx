import React, { useRef, useEffect, useState } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { EditorState } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { sql } from '@codemirror/lang-sql';
import { formatSQL } from '../../utils/sql-parser/codemirror-integration';
import './sql-editor.css';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  theme?: 'light' | 'dark';
  readOnly?: boolean;
  placeholder?: string;
  height?: string;
  showLineNumbers?: boolean;
  showErrors?: boolean;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onRun,
  theme = 'light',
  readOnly = false,
  placeholder = 'Введите SQL запрос...',
  height = '300px',
  showLineNumbers = true,
  showErrors = true
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions: Extension[] = [
      lineNumbers(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      sql(),
      EditorView.updateListener.of((update: any) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          onChange(newValue);
          
          // Подсчитываем ошибки (упрощенная версия)
          if (showErrors) {
            // Здесь можно добавить логику подсчета ошибок
            setErrorCount(0);
          }
        }
      }),
      EditorView.theme({
        '&': {
          height: height,
          fontSize: '14px',
          fontFamily: '"Fira Code", "Monaco", "Menlo", monospace',
          backgroundColor: theme === 'light' ? '#ffffff' : '#0d1117',
          position: 'relative'
        },
        '.cm-content': {
          padding: '12px',
          minHeight: height,
          color: theme === 'light' ? '#24292f' : '#f0f6fc',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: '1'
        },
        '.cm-focused': {
          outline: 'none !important'
        },
        '.cm-editor': {
          borderRadius: '0',
          border: 'none',
          backgroundColor: 'transparent',
          position: 'relative'
        },
        '.cm-scroller': {
          fontFamily: 'inherit',
          backgroundColor: 'transparent !important',
          position: 'relative',
          zIndex: '1'
        },
        '.cm-line': {
          color: 'inherit',
          position: 'relative',
          zIndex: '1'
        },
        '&.cm-editor.cm-focused': {
          outline: 'none !important'
        },
        '.cm-gutters': {
          backgroundColor: theme === 'light' ? '#f6f8fa' : '#161b22',
          borderRight: `1px solid ${theme === 'light' ? '#e1e5e9' : '#30363d'}`,
          position: 'relative',
          zIndex: '2'
        }
      }),
      EditorState.readOnly.of(readOnly)
    ];

    if (theme === 'dark') {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: value,
      extensions
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [theme, readOnly, height, showLineNumbers, showErrors]);

  // Обновляем содержимое редактора при изменении value извне
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      });
    }
  }, [value]);

  const handleFormat = () => {
    if (viewRef.current) {
      const formatted = formatSQL(viewRef.current.state.doc.toString());
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: formatted
        }
      });
    }
  };

  const handleRun = () => {
    if (onRun) {
      onRun();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter для выполнения запроса
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleRun();
    }
    
    // Shift + Alt + F для форматирования
    if (event.shiftKey && event.altKey && event.key === 'F') {
      event.preventDefault();
      handleFormat();
    }
  };

  return (
    <div className="sql-editor-container">
      <div className="sql-editor-toolbar">
        <div className="toolbar-left">
          <button 
            className="toolbar-button format-button"
            onClick={handleFormat}
            title="Форматировать код (Shift+Alt+F)"
          >
            <span className="icon">🎨</span>
            Форматировать
          </button>
          {showErrors && errorCount > 0 && (
            <div className="error-indicator">
              <span className="icon">⚠️</span>
              {errorCount} ошиб{errorCount === 1 ? 'ка' : errorCount < 5 ? 'ки' : 'ок'}
            </div>
          )}
        </div>
        <div className="toolbar-right">
          {onRun && (
            <button 
              className="toolbar-button run-button"
              onClick={handleRun}
              title="Выполнить запрос (Ctrl+Enter)"
            >
              <span className="icon">▶️</span>
              Выполнить
            </button>
          )}
        </div>
      </div>
      <div 
        ref={editorRef} 
        className={`sql-editor ${theme}`}
        onKeyDown={handleKeyDown}
      />
      <div className="sql-editor-status">
        <span className="status-item">SQL</span>
        <span className="status-item">UTF-8</span>
        {!readOnly && (
          <span className="status-hint">
            Ctrl+Enter для выполнения • Shift+Alt+F для форматирования
          </span>
        )}
      </div>
    </div>
  );
};

export default SQLEditor;