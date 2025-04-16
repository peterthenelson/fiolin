import { FiolinFormComponentId, FiolinFormEvent, FiolinRunRequest, FiolinRunResponse, FiolinScript, FiolinScriptInterface } from '../../common/types';
import { getByRelIdAs, selectAllAs } from '../../web-utils/select-as';
import { FormCallbacks, FormComponent } from './form-component';
import { RenderedForm } from './form-renderer';

export class CustomForm extends FormComponent {
  private elem: HTMLFormElement;
  private rendered?: RenderedForm;
  private transferred: boolean;
  private readonly cbs: FormCallbacks;
  private ui?: FiolinScriptInterface;

  constructor(container: HTMLElement, callbacks: FormCallbacks) {
    super();
    this.elem = getByRelIdAs(container, 'script-form', HTMLFormElement);
    this.transferred = true;
    this.cbs = callbacks;
  }

  private isEnabled(): boolean {
    return !!(this.ui && this.ui.form);
  }

  reportValidity(): boolean {
    if (this.rendered) {
      return this.rendered.form.reportValidity();
    }
    return true;
  }

  private getFiles(): File[] {
    if (!this.rendered) return [];
    const files: File[] = [];
    for (const fileChooser of selectAllAs(this.rendered.form, 'input[type="file"]', HTMLInputElement)) {
      if (fileChooser.files !== null) {
        for (const f of fileChooser.files) {
          files.push(f);
        }
      }
    }
    return files;
  }

  private getArgs(submitter?: HTMLElement | null): Record<string,string> {
    if (!this.rendered) return {};
    const formData = new FormData(this.rendered.form, submitter);
    const args: Record<string, string> = {};
    for (const [k, v] of formData.entries()) {
      const vo = v.valueOf();
      if (vo instanceof File) {
        args[k] = vo.name !== '' ? `/input/${vo.name}` : '';
      } else {
        args[k] = v.toString();
      }
    }
    return args;
  }

  onLoad(script: FiolinScript): void {
    this.ui = script.interface;
    if (this.ui.form) {
      try {
        this.rendered = RenderedForm.render(this.elem, this.ui, {
          onEvent: (id, ev) => this.onEvent(id, ev),
          downloadFile: (f) => this.cbs.downloadFile(f),
        });
        this.rendered.form.onsubmit = (e) => {
          e.preventDefault();
          const files = this.getFiles();
          const args = this.getArgs(e.submitter);
          this.cbs.runScript(files, args);
        }
        this.rendered.form.inert = false;
        this.rendered.form.classList.remove('hidden');
        this.transferred = false;
      } catch (e) {
        this.rendered = RenderedForm.render(this.elem);
        this.transferred = true;
        throw e;
      }
    } else {
      this.rendered = RenderedForm.render(this.elem);
        this.rendered.form.classList.add('hidden');
      this.transferred = true;
    }
  }

  onEvent(id: FiolinFormComponentId, ev: FiolinFormEvent) {
    const files = this.getFiles();
    const args = this.getArgs();
    this.cbs.runScript(files, args, ev);
  }

  onRun(request: FiolinRunRequest, opts: { setCanvases?: Record<string, OffscreenCanvas> }): void {
    if (!this.rendered) return;
    // TODO: update request with
    // TODO: When they exist:
    // - reset file/run component values
    // - reset the output file display component.
    this.rendered.form.inert = true;
    if (!this.transferred) {
      opts.setCanvases ||= {};
      Object.assign(opts.setCanvases, this.rendered.transferCanvases());
      this.transferred = true;
    }
  }

  onSuccess(response: FiolinRunResponse): void {
    if (!this.rendered) return;
    this.rendered.setOutputFiles(response.outputs);
    // TODO: When they exist:
    // - update the output file display component.
    if (this.isEnabled() && !response.partial && this.rendered.shouldAutoDownload()) {
      for (const f of response.outputs) {
        this.cbs.downloadFile(f);
      }
    }
    if (response.formUpdates) {
      for (const fu of response.formUpdates) {
        this.rendered.applyUpdate(fu);
      }
    }
    this.rendered.form.inert = false;
  }

  onError(response?: FiolinRunResponse): void {
    if (!this.rendered) return;
    if (response?.formUpdates) {
      for (const fu of response.formUpdates) {
        this.rendered.applyUpdate(fu);
      }
    }
    this.rendered.form.inert = false;
  }
}