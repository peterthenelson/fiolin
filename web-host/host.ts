import { RunMessage, WorkerMessage } from '../web-utils/types';
import { getErrMsg, toErr } from '../common/errors';
import { asFiolinScript } from '../common/parse';
import { FiolinScript } from '../common/types';
const monaco = import('./monaco');

function getElementByIdAs<T extends HTMLElement>(id: string, cls: new (...args: any[])=> T): T {
  const elem = document.getElementById(id);
  if (elem === null) {
    throw new Error(`Element #${id} not found`);
  } else if (elem instanceof cls) {
    return (elem as T);
  } else {
    throw new Error(`Element #${id} is not an instance of ${cls}`);
  }
}

class TypedWorker {
  private readonly worker: Worker;
  public onmessage: ((msg: WorkerMessage) => void) | null;
  public onerror: ((ev: ErrorEvent) => void) | null;

  constructor(scriptURL: string | URL, options?: WorkerOptions) {
    this.worker = new Worker(scriptURL, options);
    this.onmessage = null;
    this.worker.onmessage = (ev) => {
      if (this.onmessage) {
        // TODO: Actually parse rather than casting
        this.onmessage(ev.data as WorkerMessage);
      }
    }
    this.onerror = null;
    this.worker.onerror = (ev) => {
      if (this.onerror) {
        this.onerror(ev);
      }
    }
  }

  postMessage(msg: WorkerMessage) {
    this.worker.postMessage(msg);
  }
}

const defaultPy: string = `# Basic script that copies input to output
import fiolin
import os

input = fiolin.get_input_basename()
stem, ext = os.path.splitext(input)
output = [stem + '-copy' + ext]
print(f'Copying /input/{input} to /output/{stem}-copy{ext}')
fiolin.cp(f'/input/{input}', f'/output/{stem}-copy{ext}')
`;
let script: FiolinScript = {
  meta: {
    title: 'Fiolin Playground',
    description: (
      'Welcome to the Fiolin Playground!\n\nWe\'ve gotten you started by ' +
      'a simple python script that copies a single input file into the ' +
      'output folder. If you want more example scripts, you can click "Edit" ' +
      'on any fiolin script to see the source code. Happy coding!'
    ),
  },
  interface: {
    inputFiles: 'SINGLE',
    outputFiles: 'SINGLE'
  },
  runtime: {},
  code: { python: defaultPy }
};

const worker = new TypedWorker('/bundle/worker.js', { type: 'classic' });

worker.onerror = (e) => {
  const term = getElementByIdAs('output-term', HTMLPreElement);
  console.error(getErrMsg(e));
  term.textContent = getErrMsg(e);
};

let initialized: undefined | Promise<void>;

async function setupScriptEditor(content: string): Promise<void> {
  const scriptEditor = getElementByIdAs('script-editor', HTMLDivElement);
  (await monaco).initMonaco(scriptEditor, content, (value: string) => {
    script.code.python = value;
  });
}

export function initFiolin(scriptUrl: string, loading?: boolean) {
  const scriptTitle = getElementByIdAs('script-title', HTMLDivElement);
  const scriptDesc = getElementByIdAs('script-desc', HTMLPreElement);
  initialized = (async () => {
    try {
      worker.onmessage = handleMessage;
      if (loading) {
        scriptTitle.textContent = scriptUrl;
        scriptDesc.textContent = `Fetching script from\n${scriptUrl}`;
      }
      const resp = await fetch(scriptUrl);
      const parsed = await resp.json();
      console.log(parsed);
      script = asFiolinScript(parsed);
      scriptTitle.textContent = script.meta.title;
      scriptDesc.textContent = script.meta.description;
      setupScriptEditor(script.code.python);
      const button = getElementByIdAs('script-mode-button', HTMLDivElement);
      button.onclick = () => {
        const editor = getElementByIdAs('script-editor', HTMLDivElement);
        if (editor.classList.contains('hidden')) {
          editor.classList.remove('hidden');
        } else {
          editor.classList.add('hidden');
        }
      };
    } catch (e) {
      console.log('Failed to fetch script!');
      const err = toErr(e);
      console.error(err);
      scriptDesc.textContent = (
        `Failed to fetch script from\n${scriptUrl}\n${err.message}`);
    }
  })();
}

export function initPlayground() {
  const scriptTitle = getElementByIdAs('script-title', HTMLDivElement);
  const scriptDesc = getElementByIdAs('script-desc', HTMLPreElement);
  scriptTitle.textContent = script.meta.title;
  scriptDesc.textContent = script.meta.description;
  getElementByIdAs('script-editor', HTMLDivElement).classList.remove('hidden');
  setupScriptEditor(script.code.python);
  worker.onmessage = handleMessage;
  initialized = (async () => {})();
}

async function colorizeLang(lang: string): Promise<void> {
  const readyMonaco = await monaco;
  await Promise.all(Array.from(
    document.querySelectorAll(`code.language-${lang}`),
    (e) => readyMonaco.colorize(e as HTMLElement, lang)
  ));
}

export async function colorizeExamples(): Promise<void> {
  await Promise.all([
    colorizeLang('py'), colorizeLang('json'), colorizeLang('sh')
  ]);
}

export function die(msg: string) {
  const scriptDesc = getElementByIdAs('script-desc', HTMLPreElement);
  scriptDesc.textContent = msg;
  throw new Error(msg);
}

async function runScript() {
  const term = getElementByIdAs('output-term', HTMLPreElement);
  term.textContent = '';
  (await monaco).clearMonacoErrors();
  const file = getElementByIdAs('input-files-chooser', HTMLInputElement).files![0];
  const fileText = document.querySelector('#input-files p.files-panel-text');
  if (fileText !== null && fileText instanceof HTMLParagraphElement) {
    fileText.title = file.name;
    fileText.textContent = file.name;
  } else {
    console.error('Could not find #input-files p.files-panel-text');
  }
  const msg: RunMessage = { type: 'RUN', script, request: { inputs: [file], argv: '' } };
  worker.postMessage(msg);
}

async function handleMessage(msg: WorkerMessage): Promise<void> {
  const term = getElementByIdAs('output-term', HTMLPreElement);
  if (msg.type === 'LOADED') {
    term.textContent = 'Pyodide Loaded';
    await initialized;
    const fileChooser = getElementByIdAs('input-files-chooser', HTMLInputElement);
    fileChooser.disabled = false;
    fileChooser.onchange = runScript;
  } else if (msg.type === 'STDOUT') {
    term.textContent += msg.value + '\n';
  } else if (msg.type === 'STDERR') {
    console.warn(msg.value);
    term.textContent += msg.value + '\n';
  } else if (msg.type === 'SUCCESS') {
    if (msg.response.outputs.length > 0) {
      for (const f of msg.response.outputs) {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(f);
        elem.download = f.name;
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
      }
    } else {
      term.textContent += (
          '='.repeat(30) + '\nScript did not produce an output file.\n');
    }
  } else if (msg.type === 'ERROR') {
    if (typeof msg.lineno !== 'undefined') {
      console.warn(msg.error.message);
      (await monaco).setMonacoError(msg.lineno, msg.error.message);
    } else {
      console.warn(msg.error);
    }
    term.textContent = msg.error.toString();
  } else {
    term.textContent = `Unexpected event data: ${msg}`;
    console.error(`Unexpected event data: ${msg}`);
  }
};
