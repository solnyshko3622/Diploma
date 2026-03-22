import React from 'react';
import SQLEditor from '../SQLEditor/SQLEditor';
import './editor.css';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  theme?: 'light' | 'dark';
  readOnly?: boolean;
  placeholder?: string;
  height?: string;
}

const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  onRun,
  theme = 'light',
  readOnly = false,
  placeholder = 'Введите SQL запрос...',
  height = '400px'
}) => {
  return (
    <div className="editor-wrapper">
      <SQLEditor
        value={value}
        onChange={onChange}
        onRun={onRun}
        theme={theme}
        readOnly={readOnly}
        placeholder={placeholder}
        height={height}
        showLineNumbers={true}
        showErrors={true}
      />
    </div>
  );
};

export default Editor;