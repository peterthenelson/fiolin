import { RunMessage, WorkerMessage } from '../web-utils/types';
import { getErrMsg, toErr } from '../common/errors';
import { asFiolinScript } from '../common/parse';
import { FiolinScript } from '../common/types';

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
import js
import os.path

infname = os.path.join('/input', js.inputs[0])
stem, ext = os.path.splitext(js.inputs[0])
js.outputs = [stem + '-copy' + ext]
outfname = os.path.join('/output', js.outputs[0])

with open(infname, 'rb') as infile:
  print(f'opened {infname} (to read)')
  with open(outfname, 'wb') as outfile:
    print(f'opened {outfname} (to write)')
    outfile.write(infile.read())
  print('copied input to output')
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

async function initMonaco(content: string): Promise<void> {
  const scriptEditor = getElementByIdAs('script-editor', HTMLDivElement);
  return import('./monaco').then((monaco) => {
    monaco.initMonaco(scriptEditor, content, (value: string) => {
      script.code.python = value;
    });
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
      initMonaco(script.code.python);
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
  initMonaco(script.code.python);
  worker.onmessage = handleMessage;
  initialized = (async () => {})();
}

export function die(msg: string) {
  const scriptDesc = getElementByIdAs('script-desc', HTMLPreElement);
  scriptDesc.textContent = msg;
  throw new Error(msg);
}

function runScript() {
  const term = getElementByIdAs('output-term', HTMLPreElement);
  term.textContent = '';
  const file = getElementByIdAs('file-chooser', HTMLInputElement).files![0];
  const msg: RunMessage = { type: 'RUN', script, request: { inputs: [file], argv: '' } };
  worker.postMessage(msg);
}

async function handleMessage(msg: WorkerMessage): Promise<void> {
  const term = getElementByIdAs('output-term', HTMLPreElement);
  if (msg.type === 'LOADED') {
    term.textContent = 'Pyodide Loaded';
    await initialized;
    const fileChooser = getElementByIdAs('file-chooser', HTMLInputElement);
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
    console.warn(msg.error);
    term.textContent = msg.error.toString();
  } else {
    term.textContent = `Unexpected event data: ${msg}`;
    console.error(`Unexpected event data: ${msg}`);
  }
};
