// Import all the editor features but only the language support for a python,
// json, and bash.
import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { FiolinScript } from '../common/types';
import YAML from 'yaml';

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

export type FiolinScriptEditorModel = 'script.py' | 'script.yml';

export class FiolinScriptEditor {
  // TODO: Two models, one yaml and one py, with corresponding methods and
  // callbacks.
  private readonly py: monaco.editor.ITextModel;
  private pyState: monaco.editor.ICodeEditorViewState | null;
  private readonly yml: monaco.editor.ITextModel;
  private ymlState: monaco.editor.ICodeEditorViewState | null;
  private currentModel: FiolinScriptEditorModel;
  private readonly editor: monaco.editor.IStandaloneCodeEditor;

  constructor(elem: HTMLElement, onchange?: (model: FiolinScriptEditorModel, value: string) => void) {
    this.py = monaco.editor.createModel('', 'python', monaco.Uri.parse('file:///script.py'));
    this.pyState = null;
    this.yml = monaco.editor.createModel('', 'yaml', monaco.Uri.parse('file:///script.yml'));
    this.ymlState = null;
    this.currentModel = 'script.py';
    this.editor = monaco.editor.create(elem, {
      model: this.py,
      theme: 'vs-dark',
      automaticLayout: true,
      ...(isNarrow() ? narrowOpts : {})
    });
    if (onchange) {
      this.py.onDidChangeContent(() => {
        onchange('script.py', this.py.getValue());
      });
      this.yml.onDidChangeContent(() => {
        onchange('script.yml', this.yml.getValue());
      });
    }
  }

  switchTab(model: FiolinScriptEditorModel) {
    if (model === this.currentModel) {
      return;
    }
    this.currentModel = model;
    let newModel: monaco.editor.ITextModel;
    let newState: monaco.editor.ICodeEditorViewState | null;
    if (model === 'script.py') {
      this.ymlState = this.editor.saveViewState();
      newModel = this.py;
      newState = this.pyState;
    } else {
      this.pyState = this.editor.saveViewState();
      newModel = this.yml;
      newState = this.ymlState;
    }
    this.editor.setModel(newModel);
		this.editor.restoreViewState(newState);
		this.editor.focus();
  }

  setScript(script: FiolinScript) {
    this.py.setValue(script.code.python);
    const { code, ...scriptNoCode } = script;
    this.yml.setValue(YAML.stringify(scriptNoCode));
  }

  getContents(): Map<FiolinScriptEditorModel, string> {
    return new Map([['script.py', this.py.getValue()], ['script.yml', this.yml.getValue()]]);
  }

  clearErrors() {
    monaco.editor.setModelMarkers(this.py, 'fiolin', []);
    monaco.editor.setModelMarkers(this.yml, 'fiolin', []);
  }

  setError(model: FiolinScriptEditorModel, lineno: number, msg: string) {
    const m = model === 'script.py' ? this.py : this.yml;
    const line = m.getLineContent(lineno);
    const startCol = 1 + (line.match(/^\s*/)?.[0]?.length || 0);
    const endCol = 1 + line.length - (line.match(/\s*$/)?.[0]?.length || 0);
    console.log(line, startCol, endCol);
    monaco.editor.setModelMarkers(m, 'fiolin', [{
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
  } else if (lang === 'yml') {
    lang = 'yaml';
  }
  return monaco.editor.colorizeElement(e, { mimeType: lang, theme: 'vs-dark' });
}
