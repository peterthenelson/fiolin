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
    title: 'Example Script',
    description: 'Copies input to output'
  },
  interface: {
    inputFiles: 'SINGLE',
    outputFiles: 'SINGLE'
  },
  runtime: {},
  code: { python: defaultPy }
};

const worker = new TypedWorker('/worker.js', { type: 'classic' });

worker.onerror = (e) => {
  const outputPane = getElementByIdAs('output-pane', HTMLTextAreaElement);
  console.error(getErrMsg(e));
  outputPane.value = getErrMsg(e);
};

let initialized: undefined | Promise<void>;

export function initFiolin(scriptUrl: string) {
  const scriptSrc = getElementByIdAs('script-src', HTMLSpanElement);
  const scriptPane = getElementByIdAs('script-pane', HTMLTextAreaElement);
  initialized = (async () => {
    try {
      worker.onmessage = handleMessage;
      scriptSrc.textContent = scriptUrl;
      scriptPane.value = `Fetching script from\n${scriptUrl}`;
      const resp = await fetch(scriptUrl);
      const parsed = await resp.json();
      console.log(parsed);
      script = asFiolinScript(parsed);
      scriptSrc.textContent = script.meta.title;
      scriptSrc.title = script.meta.description;
      scriptPane.value = script.code.python;
    } catch (e) {
      console.log('Failed to fetch script!');
      const err = toErr(e);
      console.error(err);
      scriptPane.value = (
        `Failed to fetch script from\n${scriptUrl}\n${err.message}`);
    }
  })();
}

export function initPlayground() {
  const scriptSrc = getElementByIdAs('script-src', HTMLSpanElement);
  const scriptPane = getElementByIdAs('script-pane', HTMLTextAreaElement);
  scriptSrc.textContent = script.meta.title;
  scriptSrc.title = script.meta.description;
  scriptPane.value = script.code.python;
  worker.onmessage = handleMessage;
  initialized = (async () => {})();
}

export function die(msg: string) {
  const scriptPane = getElementByIdAs('script-pane', HTMLTextAreaElement);
  scriptPane.value = msg;
  throw new Error(msg);
}

function runScript() {
  const scriptPane = getElementByIdAs('script-pane', HTMLTextAreaElement);
  const outputPane = getElementByIdAs('output-pane', HTMLTextAreaElement);
  outputPane.value = '';
  const file = getElementByIdAs('file-chooser', HTMLInputElement).files![0];
  script.code.python = scriptPane.value;
  const msg: RunMessage = { type: 'RUN', script, request: { inputs: [file], argv: '' } };
  worker.postMessage(msg);
}

async function handleMessage(msg: WorkerMessage): Promise<void> {
  const outputPane = getElementByIdAs('output-pane', HTMLTextAreaElement);
  if (msg.type === 'LOADED') {
    outputPane.value = 'Pyodide Loaded';
    await initialized;
    const fileChooser = getElementByIdAs('file-chooser', HTMLInputElement);
    fileChooser.disabled = false;
    fileChooser.onchange = runScript;
  } else if (msg.type === 'STDOUT') {
    outputPane.value += msg.value + '\n';
  } else if (msg.type === 'STDERR') {
    console.warn(msg.value);
    outputPane.value += msg.value + '\n';
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
      outputPane.value += (
          '='.repeat(30) + '\nScript did not produce an output file.\n');
    }
  } else if (msg.type === 'ERROR') {
    console.warn(msg.error);
    outputPane.value = msg.error.toString();
  } else {
    outputPane.value = `Unexpected event data: ${msg}`;
    console.error(`Unexpected event data: ${msg}`);
  }
};
