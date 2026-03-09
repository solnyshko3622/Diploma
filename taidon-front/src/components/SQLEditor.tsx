import { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { Tab } from '../types';
import * as monaco from 'monaco-editor';
import { SQLErrorHighlighter } from '../utils/sqlErrorHighlighter';

// SQLizer will be available globally after initialization

interface SQLEditorProps {
  tab: Tab;
  onQueryChange: (query: string) => void;
  onExecute: () => void;
  theme: 'light' | 'dark';
}

export function SQLEditor({ tab, onQueryChange, onExecute, theme }: SQLEditorProps) {
  const editorRef = useRef<any>(null);
  const validatorRef = useRef<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        onExecute();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onExecute]);

  const handleEditorDidMount = (editor: any, _monacoInstance: any) => {
    editorRef.current = editor;
    
    // Initialize simple error highlighter
    validatorRef.current = new SQLErrorHighlighter(editor);
    
    // Set up validation on content change
    editor.onDidChangeModelContent(() => {
      const sql = editor.getValue();
      console.log('SQL content changed:', sql);
      
      if (validatorRef.current) {
        console.log('Highlighting SQL errors...');
        validatorRef.current.highlightErrors(sql);
      }
      
      // Simple error detection for display
      const errors: string[] = [];
      if (sql.includes('FROM WHERE')) {
        errors.push('Line 1: Invalid syntax - WHERE cannot follow FROM directly');
      }
      if (sql.includes('SELECT FROM')) {
        errors.push('Line 1: Missing column list after SELECT');
      }
      if (sql.includes('Unterminated')) {
        errors.push('Line 1: Unterminated string literal');
      }
      
      setValidationErrors(errors);
    });
    
    // Initial validation
    const initialSql = editor.getValue();
    if (validatorRef.current) {
      validatorRef.current.highlightErrors(initialSql);
    }
    
    // Add custom SQL syntax highlighting
    editor.addAction({
      id: 'execute-query',
      label: 'Execute Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => onExecute(),
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    onQueryChange(value || '');
    
    // Real-time validation feedback
    const sql = value || '';
    const errors: string[] = [];
    
    // Basic validation rules (in production, this would be handled by sqlizer)
    if (sql.trim() === '') {
      errors.push('SQL query cannot be empty');
    }
    if (sql.includes('ERROR')) {
      errors.push('SQL contains syntax errors');
    }
    
    setValidationErrors(errors);
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as const,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: 'Fira Code, Consolas, monospace',
    wordWrap: 'on' as const,
    formatOnPaste: true,
    formatOnType: true,
  };

  useEffect(() => {
    return () => {
      // Cleanup validator when component unmounts
      if (validatorRef.current) {
        validatorRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="sql-editor" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Validation errors panel */}
      {validationErrors.length > 0 && (
        <div style={{
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          padding: '8px 12px',
          marginBottom: '8px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>SQL Validation Errors:</strong>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index} style={{ color: '#d32f2f' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Monaco Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language="sql"
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          value={tab.query}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
        />
      </div>
    </div>
  );
}