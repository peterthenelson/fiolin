import { WorkerMessage } from '../web-utils/types';
import { DeployOptions, deployScript } from './deploy-gen';
import { Deferred } from '../common/deferred';
import { getErrMsg, toErr } from '../common/errors';
import { pFiolinScript } from '../common/parse-script';
import { FiolinScript } from '../common/types';
import { parseAs } from '../common/parse';
import { TypedWorker } from './typed-worker';
const monaco = import('./monaco');

function maybeSelectAs<T extends HTMLElement>(root: HTMLElement, sel: string, cls: new (...args: any[])=> T): T {
  const elem = root.querySelector(sel);
  if (elem instanceof cls) {
    return (elem as T);
  } else {
    throw new Error(`${sel} is not an instance of ${cls}`);
  }
}

function selectAs<T extends HTMLElement>(root: HTMLElement, sel: string, cls: new (...args: any[])=> T): T {
  const elem = maybeSelectAs(root, sel, cls);
  if (elem === null) {
    throw new Error(`No matches for selector '${sel}'`);
  }
  return elem;
}

function maybeGetByRelIdAs<T extends HTMLElement>(root: HTMLElement, relativeId: string, cls: new (...args: any[])=> T): T {
  return maybeSelectAs(root, `[data-rel-id="${relativeId}"]`, cls);
}

function getByRelIdAs<T extends HTMLElement>(root: HTMLElement, relativeId: string, cls: new (...args: any[])=> T): T {
  return selectAs(root, `[data-rel-id="${relativeId}"]`, cls);
}

function getFormValue(fd: FormData, key: string): string {
  const value = fd.get(key);
  if (value !== null) return value.toString();
  throw new Error(`Expected form data to have name ${key} but got ${Array.from(fd.keys())}`);
}

function downloadFile(f: File) {
  const elem = document.createElement('a');
  elem.href = window.URL.createObjectURL(f);
  elem.download = f.name;
  document.body.appendChild(elem);
  elem.click();        
  document.body.removeChild(elem);
}

interface StorageLike {
  clear: () => void;
  getItem: (keyName: string) => string | null;
  removeItem: (keyName: string) => void;
  setItem: (keyName: string, keyValue: string) => void;
}

function setSelected(elem: HTMLSelectElement, value: string) {
  for (let option of elem.options) {
    if (option.value === value) {
      option.selected = true;
    } else {
      option.selected = false;
    }
  }
}

function populateFormFromStorage(storage: StorageLike, deployForm: HTMLFormElement) {
  selectAs(deployForm, '[name="gh-user-name"]', HTMLInputElement).value = (
    storage.getItem('deploy/gh-user-name') || '');
  selectAs(deployForm, '[name="gh-repo-name"]', HTMLInputElement).value = (
    storage.getItem('deploy/gh-repo-name') || '');
  selectAs(deployForm, '[name="gh-default-branch"]', HTMLInputElement).value = (
    storage.getItem('deploy/gh-default-branch') || 'main');
  selectAs(deployForm, '[name="gh-pages-branch"]', HTMLInputElement).value = (
    storage.getItem('deploy/gh-pages-branch') || 'gh-pages');
  const lang = storage.getItem('deploy/lang');
  const langSel = selectAs(deployForm, '[name="lang"]', HTMLSelectElement);
  if (lang === 'BAT' || lang === 'SH') {
    setSelected(langSel, lang);
  } else if (navigator.platform.startsWith('Win')) {
    setSelected(langSel, 'BAT');
  }
}

function saveFormToStorage(storage: StorageLike, deployForm: HTMLFormElement) {
  storage.setItem(
    'deploy/gh-user-name',
    selectAs(deployForm, '[name="gh-user-name"]', HTMLInputElement).value);
  storage.setItem(
    'deploy/gh-repo-name',
    selectAs(deployForm, '[name="gh-repo-name"]', HTMLInputElement).value);
  storage.setItem(
    'deploy/gh-default-branch',
    selectAs(deployForm, '[name="gh-default-branch"]', HTMLInputElement).value);
  storage.setItem(
    'deploy/gh-pages-branch',
    selectAs(deployForm, '[name="gh-pages-branch"]', HTMLInputElement).value);
  const lang = selectAs(deployForm, 'select[name="lang"]', HTMLSelectElement);
  storage.setItem(
    'deploy/lang',
    lang.options[lang.selectedIndex].value);
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

export interface FiolinComponentOptions {
  scriptUrl?: string;
  showLoading?: boolean;
  storage?: StorageLike;
}

export class FiolinComponent {
  private readonly container: HTMLElement;
  private readonly storage: StorageLike;
  private readonly scriptTitle: HTMLDivElement;
  private readonly modeButton: HTMLDivElement;
  private readonly deployButton: HTMLDivElement;
  private readonly scriptDesc: HTMLPreElement;
  private readonly fileChooser: HTMLInputElement;
  private readonly fileText: HTMLParagraphElement;
  private readonly scriptEditor: HTMLDivElement;
  private readonly outputTerm: HTMLPreElement;
  private readonly worker: TypedWorker;
  public readonly script: Promise<FiolinScript>;
  public readonly readyToRun: Deferred<void>;

  constructor(container: HTMLElement, opts?: FiolinComponentOptions) {
    this.container = container;
    this.storage = opts?.storage || window.localStorage;
    this.scriptTitle = getByRelIdAs(container, 'script-title', HTMLDivElement);
    this.modeButton = getByRelIdAs(container, 'dev-mode-button', HTMLDivElement);
    this.deployButton = getByRelIdAs(container, 'deploy-button', HTMLDivElement);
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
    this.script = this.loadScript(container, opts || {});
    this.readyToRun = new Deferred();
  }

  private async setupScriptEditor(content: string): Promise<void> {
    (await monaco).initMonaco(this.scriptEditor, content, async (value: string) => {
      const script = await this.script;
      script.code.python = value;
    });
  }

  private async loadScript(container: HTMLElement, opts: FiolinComponentOptions) {
    try {
      this.fileChooser.disabled = false;
      this.fileChooser.onchange = () => { this.runScript() };
      let script: FiolinScript = defaultScript;
      if (opts.scriptUrl) {
        if (opts.showLoading) {
          this.scriptTitle.textContent = opts.scriptUrl;
          this.scriptDesc.textContent = `Fetching script from\n${opts.scriptUrl}`;
        }
        const resp = await fetch(opts.scriptUrl);
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
      const dialog = maybeGetByRelIdAs(container, 'deploy-dialog', HTMLDialogElement);
      if (dialog !== null) {
        const deployForm = getByRelIdAs(dialog, 'deploy-form', HTMLFormElement);
        deployForm.onsubmit = async (event) => {
          if (event.submitter instanceof HTMLButtonElement &&
              event.submitter.value === 'cancel') {
            return;
          }
          saveFormToStorage(this.storage, deployForm);
          const fd = new FormData(deployForm);
          const opts: DeployOptions = {
            gh: {
              userName: getFormValue(fd, 'gh-user-name'),
              repoName: getFormValue(fd, 'gh-repo-name'),
              defaultBranch: getFormValue(fd, 'gh-default-branch'),
              pagesBranch: getFormValue(fd, 'gh-pages-branch'),
            },
            scriptId: getFormValue(fd, 'script-id'),
            lang: fd.get('lang')?.toString() === 'SH' ? 'SH' : 'BAT',
          };
          downloadFile(deployScript(await this.script, opts));
        };
        this.deployButton.onclick = async () => {
          selectAs(deployForm, '[name="script-id"]', HTMLInputElement).value = (
            script.meta.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'));
          populateFormFromStorage(this.storage, deployForm);
          dialog.showModal();
        };
      }
      return script;
    } catch (e) {
      console.log('Failed to fetch script!');
      const err = toErr(e);
      console.error(err);
      this.scriptDesc.textContent = (
        `Failed to fetch script from\n${opts.scriptUrl}\n${err.message}`);
      throw e;
    }
  }

  private async runScript() {
    this.fileChooser.disabled = true;
    const script = await this.script;
    await this.readyToRun.promise;
    this.container.classList.remove('error');
    this.outputTerm.textContent = '';
    (await monaco).clearMonacoErrors();
    const file = this.fileChooser.files![0];
    this.fileText.title = file.name;
    this.fileText.textContent = file.name;
    this.container.classList.add('running');
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
      this.container.classList.remove('running');
      if (msg.response.outputs.length > 0) {
        for (const f of msg.response.outputs) {
          downloadFile(f);
        }
      } else {
        this.outputTerm.textContent += (
            '='.repeat(30) + '\nScript did not produce an output file.\n');
      }
    } else if (msg.type === 'ERROR') {
      this.fileChooser.disabled = false;
      this.container.classList.add('error');
      this.container.classList.remove('running');
      if (typeof msg.lineno !== 'undefined') {
        console.warn(msg.error.message);
        (await monaco).setMonacoError(msg.lineno, msg.error.message);
      } else {
        console.warn(msg.error);
      }
      this.outputTerm.textContent = msg.error.toString();
    } else {
      this.container.classList.add('error');
      this.outputTerm.textContent = `Unexpected event data: ${msg}`;
      console.error(`Unexpected event data: ${msg}`);
    }
  }
}
