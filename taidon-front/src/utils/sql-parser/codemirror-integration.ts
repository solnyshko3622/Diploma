import type { Extension } from '@codemirror/state';
import { ViewPlugin, ViewUpdate, Decoration } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { linter } from '@codemirror/lint';
import type { Diagnostic } from '@codemirror/lint';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import type { CompletionResult } from '@codemirror/autocomplete';
import { SQLParser } from './index';
import type { ParseError, Token } from './types';

/**
 * Создает расширение CodeMirror для подсветки SQL синтаксиса
 */
export function sqlHighlighting(): Extension {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet;
    parser: SQLParser;

    constructor(view: any) {
      this.parser = new SQLParser(view.state.doc.toString());
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.parser = new SQLParser(update.state.doc.toString());
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: any): DecorationSet {
      const { tokens } = this.parser.parse();
      const decorations: any[] = [];

      for (const token of tokens) {
        const className = this.getTokenClassName(token);
        if (className) {
          const decoration = Decoration.mark({
            class: className
          });
          decorations.push(decoration.range(token.start, token.end));
        }
      }

      return Decoration.set(decorations);
    }

    getTokenClassName(token: Token): string {
      switch (token.type) {
        case 'keyword':
          return 'cm-sql-keyword';
        case 'function':
          return 'cm-sql-function';
        case 'string':
          return 'cm-sql-string';
        case 'number':
          return 'cm-sql-number';
        case 'comment':
          return 'cm-sql-comment';
        case 'operator':
        case 'comparison':
          return 'cm-sql-operator';
        case 'logical':
          return 'cm-sql-logical';
        case 'identifier':
          return 'cm-sql-identifier';
        case 'variable':
          return 'cm-sql-variable';
        case 'boolean':
          return 'cm-sql-boolean';
        case 'null':
          return 'cm-sql-null';
        case 'error':
          return 'cm-sql-error';
        default:
          return '';
      }
    }
  }, {
    decorations: v => v.decorations
  });
}

/**
 * Создает линтер для обнаружения ошибок SQL
 */
export function sqlLinter(): Extension {
  return linter((view) => {
    const parser = new SQLParser(view.state.doc.toString());
    const { errors } = parser.parse();
    
    const diagnostics: Diagnostic[] = errors.map((error: ParseError) => ({
      from: error.start,
      to: error.end,
      severity: error.severity,
      message: error.message,
      source: 'sql-parser'
    }));

    return diagnostics;
  });
}

/**
 * Создает автодополнение для SQL
 */
export function sqlAutocompletion(): Extension {
  return autocompletion({
    override: [
      (context: CompletionContext): CompletionResult | null => {
        const parser = new SQLParser(context.state.doc.toString());
        const { tokens } = parser.parse();
        
        const suggestions = parser.getCompletionSuggestions(tokens, context.pos);
        
        if (suggestions.length === 0) {
          return null;
        }

        return {
          from: context.pos,
          options: suggestions.map(suggestion => ({
            label: suggestion.label,
            type: suggestion.type,
            detail: suggestion.detail,
            apply: suggestion.label
          }))
        };
      }
    ]
  });
}

/**
 * Создает полное расширение SQL для CodeMirror
 */
export function sqlExtension(): Extension {
  return [
    sqlHighlighting(),
    sqlLinter(),
    sqlAutocompletion()
  ];
}

/**
 * Утилита для форматирования SQL кода
 */
export function formatSQL(code: string): string {
  const parser = new SQLParser(code);
  return parser.format(code);
}

/**
 * Создает команду форматирования для CodeMirror
 */
export function sqlFormatCommand() {
  return {
    key: 'Shift-Alt-f',
    run: (view: any) => {
      const formatted = formatSQL(view.state.doc.toString());
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: formatted
        }
      });
      return true;
    }
  };
}