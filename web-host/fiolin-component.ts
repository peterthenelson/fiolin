import { WorkerMessage } from '../web-utils/types';
import { Deferred } from '../common/deferred';
import { getErrMsg, toErr } from '../common/errors';
import { pFiolinScript } from '../common/parse-script';
import { FiolinLogLevel, FiolinScript } from '../common/types';
import { parseAs } from '../common/parse';
import { TypedWorker } from './typed-worker';
import type { FiolinScriptEditorModel } from '../web-utils/monaco';
import { DeployDialog } from '../components/web/deploy-dialog';
import { Editor } from '../components/web/editor';
import { Terminal } from '../components/web/terminal';
import { CustomForm } from './custom-form';
import { SimpleForm } from './simple-form';
import { getByRelIdAs } from '../web-utils/select-as';
import { setSelected } from '../web-utils/set-selected';
import { StorageLike } from '../web-utils/types';

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
  private readonly customForm: CustomForm;
  private readonly simpleForm: SimpleForm;
  private readonly editor: Editor;
  private readonly terminal: Terminal;
  private readonly worker: TypedWorker;
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
    this.editor = new Editor(container, {
      update: (s, m) => this.scriptUpdated(s, m),
      updateError: (e) => this.scriptUpdateError(e),
    })
    this.simpleForm = new SimpleForm(container, {
      runScript: (files, formData) => this.runScript(files, formData),
      requestSubmit: (submitter) => this.customForm.requestSubmit(submitter),
    });
    this.terminal = new Terminal(container);
    this.worker = new TypedWorker(opts?.workerEndpoint || '/bundle/worker.js', { type: 'classic' });
    this.worker.onerror = (e) => {
      console.error(getErrMsg(e));
      this.terminal.fatal(getErrMsg(e));
    };
    this.worker.onmessage = (msg) => {
      this.handleMessage(msg);
    }
    this.script = this.loadScript(opts || {});
    this.setupHandlers();
    this.readyToRun = new Deferred();
  }

  private async updateUiForScript(script: FiolinScript) {
    this.scriptTitle.textContent = script.meta.title;
    this.scriptDesc.textContent = script.meta.description;
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
      await this.editor.setScript(script);
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
  }

  private async scriptUpdated(script: FiolinScript, model: FiolinScriptEditorModel) {
    const currentScript = await this.script;
    Object.assign(currentScript, script);
    if (model === 'script.yml') {
      await this.updateUiForScript(script);
    }
  }

  private async scriptUpdateError(e: unknown) {
    if (e instanceof Error) {
      this.scriptDesc.textContent = e.message;
    } else {
      this.scriptDesc.textContent = '[Unknown Error]';
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
    this.terminal.clear();
    await this.editor.clearErrors();
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
      console.log('Pyodide Loaded');
    } else if (msg.type === 'PACKAGES_INSTALLED') {
      await this.script;
      this.readyToRun.resolve();
    } else if (msg.type === 'LOG') {
      this.terminal.log(msg.level, msg.value);
    } else if (msg.type === 'SUCCESS') {
      this.simpleForm.onSuccess(msg.response.outputs);
      this.customForm.onSuccess(msg.response.outputs);
      this.container.classList.remove('running');
      if (msg.response.outputs.length > 0) {
        for (const f of msg.response.outputs) {
          downloadFile(f);
        }
      }
    } else if (msg.type === 'ERROR') {
      this.simpleForm.onError();
      this.customForm.onError();
      this.container.classList.add('error');
      this.container.classList.remove('running');
      if (typeof msg.lineno !== 'undefined') {
        console.warn(msg.error.message);
        await this.editor.setError('script.py', msg.lineno, msg.error.message);
      } else {
        console.warn(msg.error);
      }
      this.terminal.fatal(msg.error.toString());
      // Counterintuitive, but we want to unblock running, as it will just
      // attempt to reinstall on run.
      if (msg.error.name === 'InstallPkgsError') {
        this.readyToRun.resolve();
      }
    } else {
      this.container.classList.add('error');
      this.terminal.fatal(`Unexpected event data: ${msg}`);
      console.error(`Unexpected event data: ${msg}`);
    }
  }
}
