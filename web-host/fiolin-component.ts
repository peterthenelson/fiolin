import { WorkerMessage } from '../web-utils/types';
import { DeployOptions, deployScript } from './deploy-gen';
import { Deferred } from '../common/deferred';
import { getErrMsg, toErr } from '../common/errors';
import { pFiolinScript } from '../common/parse-script';
import { FiolinScript } from '../common/types';
import { parseAs } from '../common/parse';
import { TypedWorker } from './typed-worker';
import type { FiolinScriptEditor } from './monaco';
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
  storage.setItem('deploy/lang', lang.value);
}

export interface FiolinComponentOptions {
  url?: string;
  showLoading?: boolean;
  tutorial?: Record<string, FiolinScript>;
  storage?: StorageLike;
}

export class FiolinComponent {
  private readonly container: HTMLElement;
  private readonly tutorial?: Record<string, FiolinScript>;
  private readonly storage: StorageLike;
  private readonly scriptTitle: HTMLDivElement;
  private readonly modeButton: HTMLDivElement;
  private readonly deployButton: HTMLDivElement;
  private readonly tutorialSelect: HTMLSelectElement;
  private readonly scriptDesc: HTMLPreElement;
  private readonly fileChooser: HTMLInputElement;
  private readonly fileText: HTMLParagraphElement;
  private readonly scriptEditor: HTMLDivElement;
  private readonly outputTerm: HTMLPreElement;
  private readonly worker: TypedWorker;
  private readonly editor: Promise<FiolinScriptEditor>;
  public script: Promise<FiolinScript>;
  public readonly readyToRun: Deferred<void>;

  constructor(container: HTMLElement, opts?: FiolinComponentOptions) {
    this.container = container;
    this.tutorial = opts?.tutorial;
    this.storage = opts?.storage || window.localStorage;
    this.scriptTitle = getByRelIdAs(container, 'script-title', HTMLDivElement);
    this.modeButton = getByRelIdAs(container, 'dev-mode-button', HTMLDivElement);
    this.deployButton = getByRelIdAs(container, 'deploy-button', HTMLDivElement);
    this.tutorialSelect = getByRelIdAs(container, 'tutorial-select', HTMLSelectElement);
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
    this.editor = this.setupScriptEditor();
    this.script = this.loadScript(opts || {});
    this.setupHandlers();
    this.readyToRun = new Deferred();
  }

  private async setupScriptEditor(): Promise<FiolinScriptEditor> {
    return new (await monaco).FiolinScriptEditor(this.scriptEditor, async (value: string) => {
      const script = await this.script;
      script.code.python = value;
    });
  }

  private async loadScript(opts: FiolinComponentOptions) {
    try {
      let script: FiolinScript | undefined;
      if (opts.url) {
        if (opts.showLoading) {
          this.scriptTitle.textContent = opts.url;
          this.scriptDesc.textContent = `Fetching script from\n${opts.url}`;
        }
        const resp = await fetch(opts.url);
        const parsed = await resp.json();
        script = parseAs(pFiolinScript, parsed);
      } else if (this.tutorial && Object.keys(this.tutorial).length > 0) {
        const hash = window.location.hash.substring(1);
        if (hash !== '' && hash in this.tutorial) {
          script = this.tutorial[hash];
          setSelected(this.tutorialSelect, hash);
        } else {
          const first = Object.keys(this.tutorial).sort()[0]
          script = this.tutorial[first];
          window.location.hash = first;
        }
      } else {
        throw new Error(`FiolinComponent requires either .url or non-empty .tutorial`);
      }
      this.worker.postMessage({ type: 'INSTALL_PACKAGES', script });
      this.scriptTitle.textContent = script.meta.title;
      this.scriptDesc.textContent = script.meta.description;
      (await this.editor).setScript(script);
      return script;
    } catch (e) {
      console.log('Failed to fetch script!');
      const err = toErr(e);
      console.error(err);
      this.scriptDesc.textContent = (
        `Failed to fetch script from\n${opts.url}\n${err.message}`);
      throw e;
    }
  }

  private async setupHandlers() {
    this.fileChooser.onchange = () => { this.runScript() };
    this.fileChooser.disabled = false;
    this.modeButton.onclick = () => {
      this.container.classList.toggle('dev-mode');
    };
    // TODO: on hash change (when navigating), do this too.
    this.tutorialSelect.onchange = async () => {
      window.location.hash = this.tutorialSelect.value;
      this.script = this.loadScript({});
    };
    this.tutorialSelect.disabled = false;
    const dialog = getByRelIdAs(this.container, 'deploy-dialog', HTMLDialogElement);
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
      const script = await this.script;
      selectAs(deployForm, '[name="script-id"]', HTMLInputElement).value = (
        script.meta.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'));
      populateFormFromStorage(this.storage, deployForm);
      dialog.showModal();
    };
    const script = await this.script;
  }

  private async runScript() {
    this.fileChooser.disabled = true;
    const script = await this.script;
    await this.readyToRun.promise;
    this.container.classList.remove('error');
    this.outputTerm.textContent = '';
    (await this.editor).clearErrors();
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
        (await this.editor).setError(msg.lineno, msg.error.message);
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
