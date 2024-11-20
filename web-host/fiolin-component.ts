import { WorkerMessage } from '../web-utils/types';
import { Deferred } from '../common/deferred';
import { getErrMsg, toErr } from '../common/errors';
import { pFiolinScript } from '../common/parse-script';
import { FiolinScript } from '../common/types';
import { parseAs } from '../common/parse';
import { TypedWorker } from './typed-worker';
const monaco = import('./monaco');

function getByRelIdAs<T extends HTMLElement>(root: HTMLElement, relativeId: string, cls: new (...args: any[])=> T): T {
  const elem = root.querySelector(`[data-rel-id="${relativeId}"]`);
  if (elem === null) {
    throw new Error(`Element [data-rel-id="${relativeId}"] not found`);
  } else if (elem instanceof cls) {
    return (elem as T);
  } else {
    throw new Error(`Element [data-rel-id="${relativeId}"] is not an instance of ${cls}`);
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
let defaultScript: FiolinScript = {
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

export class FiolinComponent {
  private readonly worker: TypedWorker;
  private readonly container: HTMLElement;
  private readonly scriptTitle: HTMLDivElement;
  private readonly modeButton: HTMLDivElement;
  private readonly scriptDesc: HTMLPreElement;
  private readonly fileChooser: HTMLInputElement;
  private readonly fileText: HTMLParagraphElement;
  private readonly scriptEditor: HTMLDivElement;
  private readonly outputTerm: HTMLPreElement;
  public readonly script: Promise<FiolinScript>;
  public readonly readyToRun: Deferred<void>;

  constructor(container: HTMLElement, scriptUrl?: string, showLoading?: boolean) {
    this.container = container;
    this.scriptTitle = getByRelIdAs(container, 'script-title', HTMLDivElement);
    this.modeButton = getByRelIdAs(container, 'dev-mode-button', HTMLDivElement);
    this.scriptDesc = getByRelIdAs(container, 'script-desc', HTMLPreElement);
    this.scriptEditor = getByRelIdAs(container, 'script-editor', HTMLDivElement);
    this.fileChooser = getByRelIdAs(container, 'input-files-chooser', HTMLInputElement);
    this.fileText = getByRelIdAs(container, 'files-panel-text', HTMLParagraphElement);
    this.outputTerm = getByRelIdAs(container, 'output-term', HTMLPreElement);
    this.worker = new TypedWorker('/bundle/worker.js', { type: 'classic' });
    this.worker.onerror = (e) => {
      console.error(getErrMsg(e));
      this.outputTerm.textContent = getErrMsg(e);
    };
    this.worker.onmessage = (msg) => {
      this.handleMessage(msg);
    }
    this.script = this.loadScript(scriptUrl, showLoading);
    this.readyToRun = new Deferred();
  }

  private async setupScriptEditor(content: string): Promise<void> {
    (await monaco).initMonaco(this.scriptEditor, content, async (value: string) => {
      const script = await this.script;
      script.code.python = value;
    });
  }

  private async loadScript(scriptUrl?: string, showLoading?: boolean): Promise<FiolinScript> {
    try {
      let script: FiolinScript = defaultScript;
      if (scriptUrl) {
        if (showLoading) {
          this.scriptTitle.textContent = scriptUrl;
          this.scriptDesc.textContent = `Fetching script from\n${scriptUrl}`;
        }
        this.fileChooser.disabled = false;
        this.fileChooser.onchange = () => { this.runScript() };
        const resp = await fetch(scriptUrl);
        const parsed = await resp.json();
        script = parseAs(pFiolinScript, parsed);
      }
      console.log(script);
      this.worker.postMessage({ type: 'INSTALL_PACKAGES', script });
      this.scriptTitle.textContent = script.meta.title;
      this.scriptDesc.textContent = script.meta.description;
      this.setupScriptEditor(script.code.python);
      this.modeButton.onclick = () => {
        this.container.classList.toggle('dev-mode');
      };
      return script;
    } catch (e) {
      console.log('Failed to fetch script!');
      const err = toErr(e);
      console.error(err);
      this.scriptDesc.textContent = (
        `Failed to fetch script from\n${scriptUrl}\n${err.message}`);
      throw e;
    }
  }

  private async runScript() {
    this.fileChooser.disabled = true;
    const script = await this.script;
    await this.readyToRun.promise;
    this.outputTerm.classList.remove('error');
    this.outputTerm.textContent = '';
    this.scriptEditor.classList.remove('error');
    (await monaco).clearMonacoErrors();
    const file = this.fileChooser.files![0];
    this.fileText.title = file.name;
    this.fileText.textContent = file.name;
    this.worker.postMessage({
      type: 'RUN',
      script,
      request: { inputs: [file], argv: '' }
    });
  }

  private async handleMessage(msg: WorkerMessage): Promise<void> {
    if (msg.type === 'LOADED') {
      this.outputTerm.textContent = 'Pyodide Loaded\n';
    } else if (msg.type === 'PACKAGES_INSTALLED') {
      await this.script;
      this.readyToRun.resolve();
    } else if (msg.type === 'STDOUT') {
      this.outputTerm.textContent += msg.value + '\n';
    } else if (msg.type === 'STDERR') {
      console.warn(msg.value);
      this.outputTerm.textContent += msg.value + '\n';
    } else if (msg.type === 'SUCCESS') {
      this.fileChooser.disabled = false;
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
        this.outputTerm.textContent += (
            '='.repeat(30) + '\nScript did not produce an output file.\n');
      }
    } else if (msg.type === 'ERROR') {
      this.fileChooser.disabled = false;
      this.scriptEditor.classList.add('error');
      this.outputTerm.classList.add('error');
      if (typeof msg.lineno !== 'undefined') {
        console.warn(msg.error.message);
        (await monaco).setMonacoError(msg.lineno, msg.error.message);
      } else {
        console.warn(msg.error);
      }
      this.outputTerm.textContent = msg.error.toString();
    } else {
      this.outputTerm.classList.add('error');
      this.outputTerm.textContent = `Unexpected event data: ${msg}`;
      console.error(`Unexpected event data: ${msg}`);
    }
  }
}
