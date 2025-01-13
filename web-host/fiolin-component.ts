import { WorkerMessage } from '../web-utils/types';
import { Deferred } from '../common/deferred';
import { getErrMsg, toErr } from '../common/errors';
import { pFiolinScript } from '../common/parse-script';
import { FiolinLogLevel, FiolinScript } from '../common/types';
import { parseAs, ParseError } from '../common/parse';
import { TypedWorker } from './typed-worker';
import type { FiolinScriptEditor, FiolinScriptEditorModel } from './monaco';
import YAML, { YAMLParseError } from 'yaml';
import { DeployDialog } from '../components/web/deploy-dialog';
import { CustomForm } from './custom-form';
import { SimpleForm } from './simple-form';
import { getByRelIdAs, selectAs } from '../web-utils/select-as';
import { setSelected } from '../web-utils/set-selected';
import { StorageLike } from '../web-utils/types';
const monaco = import('./monaco');

function downloadFile(f: File) {
  const elem = document.createElement('a');
  elem.href = window.URL.createObjectURL(f);
  elem.download = f.name;
  document.body.appendChild(elem);
  elem.click();        
  document.body.removeChild(elem);
}

export interface FiolinComponentOptions {
  url?: string;
  workerEndpoint?: string;
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
  private readonly deployDialog: DeployDialog;
  private readonly tutorialSelect: HTMLSelectElement;
  private readonly scriptDesc: HTMLPreElement;
  private customForm: CustomForm;
  private simpleForm: SimpleForm;
  private readonly scriptTabs: HTMLDivElement;
  private readonly scriptEditor: HTMLDivElement;
  private readonly outputTerm: HTMLPreElement;
  private readonly log: [FiolinLogLevel, string][];
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
    this.deployDialog = new DeployDialog(container, { storage: this.storage, downloadFile })
    this.tutorialSelect = getByRelIdAs(container, 'tutorial-select', HTMLSelectElement);
    this.scriptDesc = getByRelIdAs(container, 'script-desc', HTMLPreElement);
    this.customForm = new CustomForm(container, {
      runScript: (files, formData) => this.runScript(files, formData),
      clickFileChooser: (button, action) => this.simpleForm.clickFileChooser(button, action),
      getFiles: () => this.simpleForm.getFiles(),
    });
    this.scriptTabs = getByRelIdAs(container, 'script-editor-tabs', HTMLDivElement);
    this.scriptEditor = getByRelIdAs(container, 'script-editor', HTMLDivElement);
    this.simpleForm = new SimpleForm(container, {
      runScript: (files, formData) => this.runScript(files, formData),
      requestSubmit: (submitter) => this.customForm.requestSubmit(submitter),
    });
    this.outputTerm = getByRelIdAs(container, 'output-term', HTMLPreElement);
    this.log = [];
    this.worker = new TypedWorker(opts?.workerEndpoint || '/bundle/worker.js', { type: 'classic' });
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
    return new (await monaco).FiolinScriptEditor(this.scriptEditor, async (m, v) => {
      await this.handleScriptUpdate(m, v);
    });
  }

  private async updateUiForScript(script: FiolinScript) {
    this.scriptTitle.textContent = script.meta.title;
    this.scriptDesc.textContent = script.meta.description;
    const ui = script.interface;
    this.container.classList.remove('file-chooser-hidden');
    this.container.classList.remove('input-files-none')
    this.container.classList.remove('input-files-single');
    this.container.classList.remove('input-files-multi');
    this.container.classList.remove('input-files-any');
    this.container.classList.add(`input-files-${ui.inputFiles.toLowerCase()}`);
    this.container.classList.remove('output-files-none')
    this.container.classList.remove('output-files-single');
    this.container.classList.remove('output-files-multi');
    this.container.classList.remove('output-files-any');
    this.container.classList.add(`output-files-${ui.outputFiles.toLowerCase()}`);
    this.simpleForm.onLoad(script);
    this.customForm.onLoad(script);
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
      this.updateUiForScript(script);
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
    this.modeButton.onclick = () => {
      this.container.classList.toggle('dev-mode');
    };
    window.addEventListener('hashchange', () => {
      this.script = this.loadScript({});
    });
    this.tutorialSelect.onchange = async () => {
      window.location.hash = this.tutorialSelect.value;
    };
    this.tutorialSelect.disabled = false;
    this.deployButton.onclick = async () => {
      const script = await this.script;
      this.deployDialog.showModal(script);
    };
    this.scriptTabs.onclick = async (event) => {
      const editor = await this.editor;
      if (event.target instanceof HTMLElement && event.target.dataset['model']) {
        const model = event.target.dataset['model'];
        if (model !== 'script.py' && model !== 'script.yml') {
          throw new Error(`Expected data-model to be script.py or script.yml; got ${model}`);
        }
        for (const child of this.scriptTabs.children) {
          child.classList.remove('active');
        }
        event.target.classList.add('active');
        editor.switchTab(model);
      }
    };
  }
  
  private async handleScriptUpdate(model: FiolinScriptEditorModel, value: string) {
    const script = await this.script;
    const editor = await this.editor;
    if (model === 'script.py') {
      script.code.python = value;
    } else {
      try {
        const template = YAML.parse(value);
        const newScript = { code: { python: script.code.python }, ...template };
        Object.assign(script, parseAs(pFiolinScript, newScript));
        this.updateUiForScript(script);
        editor.clearErrors();
      } catch (e) {
        if (e instanceof YAMLParseError && e.linePos) {
          editor.setError('script.yml', e.linePos[0].line, e.message);
          this.scriptDesc.textContent = e.message;
        } else if (e instanceof ParseError) {
          const lines = value.split(/\n/);
          const field = e.objPath.parts.at(-1);
          const fieldRe = new RegExp(`^\\s*${field}:`);
          for (let i = 0; field && i < lines.length; i++) {
            if (lines[i].match(fieldRe)) {
              editor.setError('script.yml', i + 1, e.message);
            }
          }
          this.scriptDesc.textContent = e.message;
        } else if (e instanceof Error) {
          console.error(e);
          this.scriptDesc.textContent = e.message;
        } else {
          console.error(e);
        }
      }
    }
  }

  private async runScript(files: File[], formData?: FormData) {
    if (!this.simpleForm.reportValidity() || !this.customForm.reportValidity()) {
      return;
    }
    this.simpleForm.onRun(files, formData);
    this.customForm.onRun(files, formData);
    const script = await this.script;
    await this.readyToRun.promise;
    this.container.classList.remove('error');
    this.outputTerm.textContent = '';
    this.log.length = 0;
    (await this.editor).clearErrors();
    if ((files === null || files.length === 0) &&
        (script.interface.inputFiles !== 'NONE' &&
         script.interface.inputFiles !== 'ANY')) {
      this.container.classList.add('error');
      this.simpleForm.onError();
      this.customForm.onError();
    } else {
      this.container.classList.add('running');
      const args: Record<string, string> = {};
      // TODO: Remove this once decoupled
      if (!formData) {
        formData = this.customForm.getFormData();
      }
      for (const [k, v] of formData.entries()) {
        args[k] = v.toString();
      }
      this.worker.postMessage({
        type: 'RUN',
        script,
        request: { inputs: files, args }
      });
    }
  }

  private async handleMessage(msg: WorkerMessage): Promise<void> {
    if (msg.type === 'LOADED') {
      this.outputTerm.textContent = 'Pyodide Loaded\n';
    } else if (msg.type === 'PACKAGES_INSTALLED') {
      await this.script;
      this.readyToRun.resolve();
    } else if (msg.type === 'LOG') {
      this.log.push([msg.level, msg.value]);
      this.outputTerm.textContent += msg.level[0] + ': ' + msg.value + '\n';
      this.outputTerm.scroll({ top: this.outputTerm.scrollHeight, behavior: 'smooth' });
    } else if (msg.type === 'SUCCESS') {
      this.simpleForm.onSuccess(msg.response.outputs);
      this.customForm.onSuccess(msg.response.outputs);
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
      this.simpleForm.onError();
      this.customForm.onError();
      this.container.classList.add('error');
      this.container.classList.remove('running');
      if (typeof msg.lineno !== 'undefined') {
        console.warn(msg.error.message);
        (await this.editor).setError('script.py', msg.lineno, msg.error.message);
      } else {
        console.warn(msg.error);
      }
      this.outputTerm.textContent = msg.error.toString();
      // Counterintuitive, but we want to unblock running, as it will just
      // attempt to reinstall on run.
      if (msg.error.name === 'InstallPkgsError') {
        this.readyToRun.resolve();
      }
    } else {
      this.container.classList.add('error');
      this.outputTerm.textContent = `Unexpected event data: ${msg}`;
      console.error(`Unexpected event data: ${msg}`);
    }
  }
}
