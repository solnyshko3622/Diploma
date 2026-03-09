import * as monaco from 'monaco-editor';

export class SQLErrorHighlighter {
  private editor: any;
  private decorationIds: string[] = [];

  constructor(editor: any) {
    this.editor = editor;
  }

  public highlightErrors(sql: string): void {
    console.log('Highlighting errors for SQL:', sql);
    
    // Clear previous decorations
    if (this.decorationIds.length > 0) {
      this.editor.deltaDecorations(this.decorationIds, []);
      this.decorationIds = [];
    }

    const errors = this.detectSQLErrors(sql);
    console.log('Detected errors:', errors);
    
    if (errors.length === 0) {
      console.log('No errors found');
      return;
    }

    // Use simple decorations with basic styling
    const decorations = errors.map(error => {
      const range = new monaco.Range(
        error.line,
        error.column,
        error.line,
        error.column + error.length
      );
      
      console.log('Creating decoration for range:', range);
      
      return {
        range: range,
        options: {
          // Use inline style for direct styling
          inlineClassName: 'red-underline',
          hoverMessage: { value: error.message },
          stickiness: 1
        }
      };
    });

    console.log('Creating decorations:', decorations);
    this.decorationIds = this.editor.deltaDecorations([], decorations);
    console.log('Decoration IDs:', this.decorationIds);
    
    // Also try to force a refresh
    this.editor.layout();
  }

  private detectSQLErrors(sql: string): Array<{line: number, column: number, length: number, message: string}> {
    const errors: Array<{line: number, column: number, length: number, message: string}> = [];
    const lines = sql.split('\n');

    // Simple SQL error detection
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for common SQL errors
      if (line.includes('FROM WHERE')) {
        const index = line.indexOf('FROM WHERE');
        errors.push({
          line: lineNumber,
          column: index + 1,
          length: 10,
          message: 'Invalid syntax: WHERE cannot follow FROM directly'
        });
      }

      if (line.includes('SELECT FROM')) {
        const index = line.indexOf('SELECT FROM');
        errors.push({
          line: lineNumber,
          column: index + 1,
          length: 11,
          message: 'Missing column list after SELECT'
        });
      }

      if (line.includes('INSERT INTO') && !line.includes('VALUES') && !line.includes('SELECT')) {
        const index = line.indexOf('INSERT INTO');
        errors.push({
          line: lineNumber,
          column: index + 1,
          length: 11,
          message: 'INSERT statement missing VALUES or SELECT clause'
        });
      }

      // Check for unterminated strings
      const stringMatch = line.match(/['"][^'"]*$/);
      if (stringMatch) {
        const index = stringMatch.index || 0;
        errors.push({
          line: lineNumber,
          column: index + 1,
          length: line.length - index,
          message: 'Unterminated string literal'
        });
      }

      // Check for missing commas in column lists (but allow SELECT column FROM pattern)
      const columnListMatch = line.match(/(SELECT\s+)(\w+)(\s+\w+)/);
      if (columnListMatch && !line.includes(',')) {
        const index = columnListMatch.index || 0;
        // Only flag error if the second word is not FROM
        const secondWord = columnListMatch[3].trim();
        if (secondWord.toUpperCase() !== 'FROM') {
          errors.push({
            line: lineNumber,
            column: index + columnListMatch[1].length + 1,
            length: columnListMatch[2].length,
            message: 'Missing comma between columns'
          });
        }
      }
    }

    return errors;
  }

  public dispose(): void {
    if (this.decorationIds.length > 0) {
      this.editor.deltaDecorations(this.decorationIds, []);
      this.decorationIds = [];
    }
  }
}