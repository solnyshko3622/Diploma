import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// vs (Visual Studio Light)
export const vsTheme = EditorView.theme({
  '&': {
    color: '#000000',
    backgroundColor: '#ffffff'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#000000'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#000000'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#add6ff'
  },
  '.cm-activeLine': {
    backgroundColor: '#f0f0f0'
  },
  '.cm-gutters': {
    backgroundColor: '#f8f8f8',
    color: '#237893',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f0f0f0'
  }
}, { dark: false });

export const vsHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#0000ff' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#001080' },
  { tag: [t.function(t.variableName), t.labelName], color: '#795e26' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#0070c1' },
  { tag: [t.definition(t.name), t.separator], color: '#000000' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#098658' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#0000ff' },
  { tag: [t.meta, t.comment], color: '#008000' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#0000ff' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#a31515' },
  { tag: t.invalid, color: '#cd3131' }
]);

// vs-dark (Visual Studio Dark)
export const vsDarkTheme = EditorView.theme({
  '&': {
    color: '#d4d4d4',
    backgroundColor: '#1e1e1e'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#d4d4d4'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#d4d4d4'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#264f78'
  },
  '.cm-activeLine': {
    backgroundColor: '#2a2d2e'
  },
  '.cm-gutters': {
    backgroundColor: '#1e1e1e',
    color: '#858585',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#2a2d2e'
  }
}, { dark: true });

export const vsDarkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#569cd6' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#9cdcfe' },
  { tag: [t.function(t.variableName), t.labelName], color: '#dcdcaa' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#4fc1ff' },
  { tag: [t.definition(t.name), t.separator], color: '#d4d4d4' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#b5cea8' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#d4d4d4' },
  { tag: [t.meta, t.comment], color: '#6a9955' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#569cd6' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#ce9178' },
  { tag: t.invalid, color: '#f44747' }
]);

// hc-black (High Contrast Black)
export const hcBlackTheme = EditorView.theme({
  '&': {
    color: '#ffffff',
    backgroundColor: '#000000'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#ffffff'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#ffffff'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#6fc3df'
  },
  '.cm-activeLine': {
    backgroundColor: '#0a0a0a'
  },
  '.cm-gutters': {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: '1px solid #6fc3df'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#0a0a0a'
  }
}, { dark: true });

export const hcBlackHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#569cd6' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#ffffff' },
  { tag: [t.function(t.variableName), t.labelName], color: '#dcdcaa' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#4fc1ff' },
  { tag: [t.definition(t.name), t.separator], color: '#ffffff' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#b5cea8' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#ffffff' },
  { tag: [t.meta, t.comment], color: '#7ca668' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#569cd6' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#ce9178' },
  { tag: t.invalid, color: '#f44747' }
]);

// hc-light (High Contrast Light)
export const hcLightTheme = EditorView.theme({
  '&': {
    color: '#292929',
    backgroundColor: '#ffffff'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#292929'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#292929'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#0f4a85'
  },
  '.cm-activeLine': {
    backgroundColor: '#f0f0f0'
  },
  '.cm-gutters': {
    backgroundColor: '#ffffff',
    color: '#292929',
    border: '1px solid #292929'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f0f0f0'
  }
}, { dark: false });

export const hcLightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#0000ff' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#292929' },
  { tag: [t.function(t.variableName), t.labelName], color: '#795e26' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#0070c1' },
  { tag: [t.definition(t.name), t.separator], color: '#292929' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#098658' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#0000ff' },
  { tag: [t.meta, t.comment], color: '#008000' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#0000ff' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#a31515' },
  { tag: t.invalid, color: '#cd3131' }
]);

// Monokai
export const monokaiTheme = EditorView.theme({
  '&': {
    color: '#f8f8f2',
    backgroundColor: '#272822'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#f8f8f0'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#f8f8f0'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#49483e'
  },
  '.cm-activeLine': {
    backgroundColor: '#3e3d32'
  },
  '.cm-gutters': {
    backgroundColor: '#272822',
    color: '#90908a',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#3e3d32'
  }
}, { dark: true });

export const monokaiHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#f92672' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#f8f8f2' },
  { tag: [t.function(t.variableName), t.labelName], color: '#a6e22e' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#ae81ff' },
  { tag: [t.definition(t.name), t.separator], color: '#f8f8f2' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#ae81ff' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#f92672' },
  { tag: [t.meta, t.comment], color: '#75715e' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#ae81ff' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#e6db74' },
  { tag: t.invalid, color: '#f92672' }
]);

// Solarized Dark
export const solarizedDarkTheme = EditorView.theme({
  '&': {
    color: '#839496',
    backgroundColor: '#002b36'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#839496'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#839496'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#073642'
  },
  '.cm-activeLine': {
    backgroundColor: '#073642'
  },
  '.cm-gutters': {
    backgroundColor: '#002b36',
    color: '#586e75',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#073642'
  }
}, { dark: true });

export const solarizedDarkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#859900' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#268bd2' },
  { tag: [t.function(t.variableName), t.labelName], color: '#b58900' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#2aa198' },
  { tag: [t.definition(t.name), t.separator], color: '#839496' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#d33682' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#859900' },
  { tag: [t.meta, t.comment], color: '#586e75' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#cb4b16' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#2aa198' },
  { tag: t.invalid, color: '#dc322f' }
]);

// Solarized Light
export const solarizedLightTheme = EditorView.theme({
  '&': {
    color: '#657b83',
    backgroundColor: '#fdf6e3'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#657b83'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#657b83'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#eee8d5'
  },
  '.cm-activeLine': {
    backgroundColor: '#eee8d5'
  },
  '.cm-gutters': {
    backgroundColor: '#fdf6e3',
    color: '#93a1a1',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#eee8d5'
  }
}, { dark: false });

export const solarizedLightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#859900' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#268bd2' },
  { tag: [t.function(t.variableName), t.labelName], color: '#b58900' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#2aa198' },
  { tag: [t.definition(t.name), t.separator], color: '#657b83' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#d33682' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#859900' },
  { tag: [t.meta, t.comment], color: '#93a1a1' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#cb4b16' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#2aa198' },
  { tag: t.invalid, color: '#dc322f' }
]);

// GitHub Light
export const githubLightTheme = EditorView.theme({
  '&': {
    color: '#24292f',
    backgroundColor: '#ffffff'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#24292f'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#24292f'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#b3d4fc'
  },
  '.cm-activeLine': {
    backgroundColor: '#f6f8fa'
  },
  '.cm-gutters': {
    backgroundColor: '#f6f8fa',
    color: '#656d76',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f6f8fa'
  }
}, { dark: false });

export const githubLightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#cf222e' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#24292f' },
  { tag: [t.function(t.variableName), t.labelName], color: '#8250df' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#0550ae' },
  { tag: [t.definition(t.name), t.separator], color: '#24292f' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#0550ae' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#cf222e' },
  { tag: [t.meta, t.comment], color: '#6e7781' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#0550ae' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#0a3069' },
  { tag: t.invalid, color: '#cf222e' }
]);

// GitHub Dark
export const githubDarkTheme = EditorView.theme({
  '&': {
    color: '#e6edf3',
    backgroundColor: '#0d1117'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#e6edf3'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#e6edf3'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#264f78'
  },
  '.cm-activeLine': {
    backgroundColor: '#161b22'
  },
  '.cm-gutters': {
    backgroundColor: '#0d1117',
    color: '#7d8590',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#161b22'
  }
}, { dark: true });

export const githubDarkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#ff7b72' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#e6edf3' },
  { tag: [t.function(t.variableName), t.labelName], color: '#d2a8ff' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#79c0ff' },
  { tag: [t.definition(t.name), t.separator], color: '#e6edf3' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#79c0ff' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#ff7b72' },
  { tag: [t.meta, t.comment], color: '#8b949e' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#79c0ff' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#a5d6ff' },
  { tag: t.invalid, color: '#ff7b72' }
]);

// Dracula
export const draculaTheme = EditorView.theme({
  '&': {
    color: '#f8f8f2',
    backgroundColor: '#282a36'
  },
  '.cm-content': {
    padding: '10px 0',
    caretColor: '#f8f8f2'
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#f8f8f2'
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#44475a'
  },
  '.cm-activeLine': {
    backgroundColor: '#44475a'
  },
  '.cm-gutters': {
    backgroundColor: '#282a36',
    color: '#6272a4',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#44475a'
  }
}, { dark: true });

export const draculaHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#ff79c6' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#f8f8f2' },
  { tag: [t.function(t.variableName), t.labelName], color: '#50fa7b' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#bd93f9' },
  { tag: [t.definition(t.name), t.separator], color: '#f8f8f2' },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#bd93f9' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#ff79c6' },
  { tag: [t.meta, t.comment], color: '#6272a4' },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#bd93f9' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#f1fa8c' },
  { tag: t.invalid, color: '#ff5555' }
]);

// Экспорт всех тем Monaco
export const monacoThemes = {
  'vs': {
    theme: vsTheme,
    highlightStyle: vsHighlightStyle,
    name: 'Visual Studio',
    icon: '☀️'
  },
  'vs-dark': {
    theme: vsDarkTheme,
    highlightStyle: vsDarkHighlightStyle,
    name: 'Visual Studio Dark',
    icon: '🌙'
  },
  'hc-black': {
    theme: hcBlackTheme,
    highlightStyle: hcBlackHighlightStyle,
    name: 'High Contrast Black',
    icon: '⚫'
  },
  'hc-light': {
    theme: hcLightTheme,
    highlightStyle: hcLightHighlightStyle,
    name: 'High Contrast Light',
    icon: '⚪'
  },
  'monokai': {
    theme: monokaiTheme,
    highlightStyle: monokaiHighlightStyle,
    name: 'Monokai',
    icon: '🟫'
  },
  'solarized-dark': {
    theme: solarizedDarkTheme,
    highlightStyle: solarizedDarkHighlightStyle,
    name: 'Solarized Dark',
    icon: '🌚'
  },
  'solarized-light': {
    theme: solarizedLightTheme,
    highlightStyle: solarizedLightHighlightStyle,
    name: 'Solarized Light',
    icon: '🌞'
  },
  'github-light': {
    theme: githubLightTheme,
    highlightStyle: githubLightHighlightStyle,
    name: 'GitHub Light',
    icon: '🐙'
  },
  'github-dark': {
    theme: githubDarkTheme,
    highlightStyle: githubDarkHighlightStyle,
    name: 'GitHub Dark',
    icon: '🐙'
  },
  'dracula': {
    theme: draculaTheme,
    highlightStyle: draculaHighlightStyle,
    name: 'Dracula',
    icon: '🧛'
  }
};