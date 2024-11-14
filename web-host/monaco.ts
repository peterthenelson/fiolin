// Import all the editor features but only the language support for a python,
// json, and bash.
import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    // We only need the editor.worker.js right now, but I'm leaving these other
    // branches in so that the resulting error is obvious instead of baffling.
		if (label === 'json') {
			return '/bundle/json.worker.js';
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return '/bundle/css.worker.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return '/bundle/html.worker.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return '/bundle/ts.worker.js';
		}
		return '/bundle/editor.worker.js';
	}
}

// This in-practice means a mobile device, but the width is the thing we
// actually care about when deciding on monaco gutters and whatnot, so we just
// query that directly.
function isNarrow(): boolean {
  return window.matchMedia('(max-width: 480px)').matches;
}

const narrowOpts: monaco.editor.IStandaloneEditorConstructionOptions = {
  lineNumbers: 'off',
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  showFoldingControls: 'never',
  minimap: { enabled: false },
  overviewRulerLanes: 0,
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'hidden',
  },
};

let editor: undefined | monaco.editor.IStandaloneCodeEditor;

export function initMonaco(elem: HTMLElement | null, value: string, onchange?: (value: string) => void) {
  if (!elem) {
    console.log('No element provided to monaco; skipping initialization');
    return;
  }
  editor = monaco.editor.create(elem, {
    language: 'python',
    value,
    theme: 'vs-dark',
    automaticLayout: true,
    ...(isNarrow() ? narrowOpts : {})
  });
  if (onchange) {
    editor.onDidChangeModelContent(() => {
      onchange(editor!.getValue());
    });
  }
}

export function clearMonacoErrors() {
  if (typeof editor === 'undefined') {
    console.warn('No editor exists; skipping setting error');
    return;
  }
  const model = editor.getModel();
  if (model === null) {
    console.warn('No model found; skipping setting error')
    return;
  }
  monaco.editor.setModelMarkers(model, 'fiolin', []);
}

export function setMonacoError(lineno: number, msg: string) {
  if (typeof editor === 'undefined') {
    console.warn('No editor exists; skipping setting error');
    return;
  }
  const model = editor.getModel();
  if (model === null) {
    console.warn('No model found; skipping setting error')
    return;
  }
  const line = model.getLineContent(lineno);
  const startCol = 1 + (line.match(/^\s*/)?.[0]?.length || 0);
  const endCol = 1 + line.length - (line.match(/\s*$/)?.[0]?.length || 0);
  console.log(line, startCol, endCol);
  monaco.editor.setModelMarkers(model, 'fiolin', [{
    severity: monaco.MarkerSeverity.Error,
    message: msg,
    startLineNumber: lineno,
    endLineNumber: lineno,
    startColumn: startCol,
    endColumn: endCol,
  }]);
}

export function colorize(e: HTMLElement, lang: string): Promise<void> {
  if (lang === 'py') {
    lang = 'python';
  } else if (lang === 'sh') {
    lang = 'shell';
  } else if (lang === 'json') {
    lang = 'application/json';
  }
  return monaco.editor.colorizeElement(e, { mimeType: lang, theme: 'vs-dark' });
}
