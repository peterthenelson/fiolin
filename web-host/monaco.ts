// Import all the editor features but only the python language support.
import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
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

export function initMonaco(elem?: HTMLElement, value?: string, onchange?: (value: string) => void) {
  if (!elem) {
    console.log('No element provided to monaco; skipping initialization');
    return;
  }
  const editor = monaco.editor.create(elem, {
    language: 'python',
    value,
    theme: 'vs-dark',
    automaticLayout: true,
  });
  if (onchange) {
    editor.onDidChangeModelContent(() => {
      onchange(editor.getValue());
    });
  }
}
