# SQLizer

A lightweight SQL syntax validation and error highlighting library for Monaco Editor.

## Features

- **Real-time SQL syntax validation** with detailed error messages
- **Syntax error highlighting** with red underlines and glyph markers
- **SQL keyword autocompletion** with hover descriptions
- **Custom SQL tokenization** with syntax highlighting
- **Debounced validation** for optimal performance
- **TypeScript support** with full type definitions

## Installation

```bash
npm install sqlizer
```

## Quick Start

### Basic Usage

```javascript
import { initializeSQLizer, createSQLValidator } from 'sqlizer';
import * as monaco from 'monaco-editor';

// Initialize the library
initializeSQLizer(monaco);

// Create Monaco Editor instance
const editor = monaco.editor.create(document.getElementById('editor'), {
  value: 'SELECT * FROM users',
  language: 'sql'
});

// Create SQL validator
const validator = createSQLValidator(editor);

// Validate SQL on content change
editor.onDidChangeModelContent(() => {
  const sql = editor.getValue();
  validator.validateSQL(sql);
});
```

### React Integration

```jsx
import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { createSQLValidator } from 'sqlizer';

function SQLEditor() {
  const editorRef = useRef();
  const validatorRef = useRef();

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Initialize SQLizer
    validatorRef.current = createSQLValidator(editor);
    
    // Validate on content change
    editor.onDidChangeModelContent(() => {
      const sql = editor.getValue();
      validatorRef.current.validateSQL(sql);
    });
  };

  return (
    <Editor
      height="500px"
      language="sql"
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14
      }}
    />
  );
}
```

## API Reference

### `initializeSQLizer(monaco: any)`

Initializes the SQLizer library with Monaco Editor. This registers SQL language features and validation providers.

**Parameters:**
- `monaco` - The Monaco Editor global object

### `createSQLValidator(editor: any): MonacoSQLValidator`

Creates a new SQL validator instance for a Monaco Editor.

**Parameters:**
- `editor` - Monaco Editor instance

**Returns:** `MonacoSQLValidator` instance

### `MonacoSQLValidator` Class

#### `validateSQL(sql: string, delay?: number): void`

Validates SQL code and highlights errors in the editor.

**Parameters:**
- `sql` - SQL code to validate
- `delay` - Optional debounce delay in milliseconds (default: 300)

#### `dispose(): void`

Cleans up the validator, removing all decorations and event listeners.

### `SQLParser` Class

Standalone SQL parser that can be used without Monaco Editor.

#### `parse(sql: string): SQLParseResult`

Parses SQL code and returns tokens and errors.

**Returns:**
```typescript
{
  tokens: SQLToken[];
  errors: SQLError[];
  isValid: boolean;
}
```

## Error Types

The library detects various SQL syntax errors:

- **Unterminated strings** and comments
- **Unmatched parentheses**
- **Invalid keyword sequences**
- **Unexpected characters**
- **Basic syntax structure violations**

## Styling

Import the CSS file for proper error highlighting:

```css
@import 'sqlizer/styles/sqlizer.css';
```

Or include it in your HTML:

```html
<link rel="stylesheet" href="node_modules/sqlizer/styles/sqlizer.css">
```

## Customization

### Custom Error Styling

You can customize the error highlighting by overriding CSS classes:

```css
.sql-error-highlight {
  background-color: rgba(255, 0, 0, 0.2);
  border-bottom: 2px dotted red;
}

.sql-warning-highlight {
  background-color: rgba(255, 165, 0, 0.2);
  border-bottom: 2px dotted orange;
}
```

### Custom Validation Rules

Extend the `SQLParser` class to add custom validation rules:

```javascript
import { SQLParser } from 'sqlizer';

class CustomSQLParser extends SQLParser {
  validateSyntax(tokens, errors) {
    // Call parent validation
    super.validateSyntax(tokens, errors);
    
    // Add custom rules
    // Your validation logic here
  }
}
```

## Examples

### Basic Validation

```javascript
import { SQLParser } from 'sqlizer';

const parser = new SQLParser();
const result = parser.parse('SELECT * FROM users WHERE id = 1');

console.log(result.isValid); // true
console.log(result.errors); // []
```

### Integration with Existing Project

```javascript
// In your existing Monaco setup
import { initializeSQLizer } from 'sqlizer';

// Initialize when Monaco is loaded
if (window.monaco) {
  initializeSQLizer(window.monaco);
}

// Or use the auto-initialization
import 'sqlizer'; // This will auto-initialize if Monaco is available
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT