import { WorkerMessage } from '../../web-utils/types';
import { Deferred } from '../../common/deferred';
import { getErrMsg, toErr } from '../../common/errors';
import { FiolinScript } from '../../common/types';
import { TypedWorker } from '../../web-utils/typed-worker';
import type { FiolinScriptEditorModel } from '../../web-utils/monaco';
import { DeployDialog } from '../../components/web/deploy-dialog';
import { Editor } from '../../components/web/editor';
import { Terminal } from '../../components/web/terminal';
import { CombinedForm } from './combined-form';
import { CustomForm } from './custom-form';
import { SimpleForm } from './simple-form';
import { getByRelIdAs } from '../../web-utils/select-as';
import { FormCallbacks, FormComponent } from './form-component';
import { StorageLike } from '../../web-utils/types';
import { TutorialLoader } from './tutorial-loader';
import { UrlLoader } from './url-loader';
import { LoaderComponent } from './loader-component';
import { CombinedLoader } from './combined-loader';

function downloadFile(f: File) {
  const elem = document.createElement('a');
  elem.href = window.URL.createObjectURL(f);
  elem.download = f.name;
  document.body.appendChild(elem);
  elem.click();        
  document.body.removeChild(elem);
}

export interface ContainerOptions {
  url?: string;
  workerEndpoint?: string;
  showLoading?: boolean;
  tutorials?: Record<string, FiolinScript>;
  storage?: StorageLike;
}

export class Container {
  private readonly container: HTMLElement;
  private readonly scriptTitle: HTMLDivElement;
  private readonly modeButton: HTMLDivElement;
  private readonly deployButton: HTMLDivElement;
  private readonly scriptDesc: HTMLPreElement;
  private readonly loader: LoaderComponent;
  private readonly deployDialog: DeployDialog;
  private readonly form: FormComponent;
  private readonly editor: Editor;
  private readonly terminal: Terminal;
  private readonly worker: TypedWorker;
  public script: Promise<FiolinScript>;
  public readonly readyToRun: Deferred<void>;

  constructor(container: HTMLElement, opts?: ContainerOptions) {
    opts = opts || {};
    this.container = container;
    this.scriptTitle = getByRelIdAs(container, 'script-title', HTMLDivElement);
    this.modeButton = getByRelIdAs(container, 'dev-mode-button', HTMLDivElement);
    this.deployButton = getByRelIdAs(container, 'deploy-button', HTMLDivElement);
    this.scriptDesc = getByRelIdAs(container, 'script-desc', HTMLPreElement);
    this.loader = new CombinedLoader([
      new UrlLoader({
        url: opts.url,
        setLoadingText: opts.showLoading ? (s) => {
          this.scriptTitle.textContent = s;
          this.scriptDesc.textContent = `Fetching script from\n${s}`;
        } : undefined,
      }),
      new TutorialLoader(container, {
        tutorials: opts.tutorials,
        triggerReload: () => {
          this.script = this.loadScript();
        },
      })
    ])
    this.deployDialog = new DeployDialog(container, {
      storage: opts.storage || window.localStorage,
      downloadFile,
    });
    const formCallbacks: FormCallbacks = {
      runScript: (files, args) => this.runScript(files, args),
      downloadFile: (file) => downloadFile(file),
    };
    this.form = new CombinedForm([
      new CustomForm(container, formCallbacks),
      new SimpleForm(container, formCallbacks),
    ]);
    this.editor = new Editor(container, {
      update: (s, m) => this.scriptUpdated(s, m),
      updateError: (e) => this.scriptUpdateError(e),
    })
    this.terminal = new Terminal(container);
    this.worker = new TypedWorker(opts.workerEndpoint || '/bundle/worker.js', { type: 'classic' });
    this.worker.onerror = (e) => {
      console.error(getErrMsg(e));
      this.terminal.fatal(getErrMsg(e));
    };
    this.worker.onmessage = (msg) => {
      this.handleMessage(msg);
    }
    this.script = this.loadScript();
    this.setupHandlers();
    this.readyToRun = new Deferred();
  }

  private async updateUiForScript(script: FiolinScript) {
    this.scriptTitle.textContent = script.meta.title;
    this.scriptDesc.textContent = script.meta.description;
    this.form.onLoad(script);
  }

  private async loadScript(): Promise<FiolinScript> {
    try {
      let script: FiolinScript;
      if (this.loader.isEnabled()) {
        script = await this.loader.load();
      } else {
        throw new Error(`Container requires either .url or non-empty .tutorials`);
      }
      this.worker.postMessage({ type: 'INSTALL_PACKAGES', script });
      this.updateUiForScript(script);
      await this.editor.setScript(script);
      return script;
    } catch (e) {
      console.log('Failed to load script!');
      const err = toErr(e);
      console.error(err);
      this.scriptDesc.textContent = `Failed to load script:\n${err.message}`;
      throw e;
    }
  }

  private async setupHandlers() {
    this.modeButton.onclick = () => {
      this.container.classList.toggle('dev-mode');
    };
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

  private async runScript(files: File[], args?: Record<string, string>) {
    if (!this.form.reportValidity()) {
      return;
    }
    this.form.onRun(files, args);
    const script = await this.script;
    await this.readyToRun.promise;
    this.container.classList.remove('error');
    this.terminal.clear();
    await this.editor.clearErrors();
    if ((files === null || files.length === 0) &&
        (script.interface.inputFiles !== 'NONE' &&
         script.interface.inputFiles !== 'ANY')) {
      this.container.classList.add('error');
      this.form.onError();
    } else {
      this.container.classList.add('running');
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
      this.form.onSuccess(msg.response.outputs, msg.response.partial);
      this.container.classList.remove('running');
    } else if (msg.type === 'ERROR') {
      this.form.onError();
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
