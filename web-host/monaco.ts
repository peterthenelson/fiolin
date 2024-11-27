// Import all the editor features but only the language support for a python,
// json, and bash.
import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { FiolinScript } from '../common/types';

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

export class FiolinScriptEditor {
  // TODO: Two models, one yaml and one py, with corresponding methods and
  // callbacks.
  private readonly py: monaco.editor.ITextModel;
  private readonly editor: monaco.editor.IStandaloneCodeEditor;

  constructor(elem: HTMLElement, onchange?: (value: string) => void) {
    this.py = monaco.editor.createModel('', 'python', monaco.Uri.parse('file:///script.py'));
    this.editor = monaco.editor.create(elem, {
      model: this.py,
      theme: 'vs-dark',
      automaticLayout: true,
      ...(isNarrow() ? narrowOpts : {})
    });
    if (onchange) {
      this.py.onDidChangeContent(() => {
        onchange(this.py.getValue());
      });
    }
  }

  setScript(script: FiolinScript) {
    this.py.setValue(script.code.python);
  }

  clearErrors() {
    monaco.editor.setModelMarkers(this.py, 'fiolin', []);
  }

  setError(lineno: number, msg: string) {
    const line = this.py.getLineContent(lineno);
    const startCol = 1 + (line.match(/^\s*/)?.[0]?.length || 0);
    const endCol = 1 + line.length - (line.match(/\s*$/)?.[0]?.length || 0);
    console.log(line, startCol, endCol);
    monaco.editor.setModelMarkers(this.py, 'fiolin', [{
      severity: monaco.MarkerSeverity.Error,
      message: msg,
      startLineNumber: lineno,
      endLineNumber: lineno,
      startColumn: startCol,
      endColumn: endCol,
    }]);
  }
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
