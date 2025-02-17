import { FiolinFormComponentId, FiolinFormEvent, FiolinRunRequest, FiolinRunResponse, FiolinScript, FiolinScriptInterface } from '../../common/types';
import { getByRelIdAs, selectAllAs } from '../../web-utils/select-as';
import { FormComponent } from './form-component';
import { RenderedForm } from './form-renderer';

export interface CustomFormCallbacks {
  runScript(files: File[], args?: Record<string, string>): Promise<void>;
  downloadFile(file: File): void;
}

export class CustomForm extends FormComponent {
  private rendered: RenderedForm;
  private transferred: boolean;
  private readonly cbs: CustomFormCallbacks;
  private ui?: FiolinScriptInterface;

  constructor(container: HTMLElement, callbacks: CustomFormCallbacks) {
    super();
    this.rendered = RenderedForm.render(getByRelIdAs(container, 'script-form', HTMLFormElement));
    this.transferred = true;
    this.cbs = callbacks;
    // Disable it until the script is set.
    this.rendered.form.onsubmit = (e) => e.preventDefault();
  }

  private isEnabled(): boolean {
    return !!(this.ui && this.ui.form);
  }

  reportValidity(): boolean {
    return this.rendered.form.reportValidity();
  }

  onLoad(script: FiolinScript): void {
    this.ui = script.interface;
    if (this.ui.form) {
      this.rendered = RenderedForm.render(this.rendered.form, this.ui, (id, ev) => this.onEvent(id, ev));
      this.rendered.form.onsubmit = (e) => {
        e.preventDefault();
        const files: File[] = [];
        for (const fileChooser of selectAllAs(this.rendered.form, 'input[type="file"]', HTMLInputElement)) {
          if (fileChooser.files !== null) {
            for (const f of fileChooser.files) {
              files.push(f);
            }
          }
        }
        const formData = new FormData(this.rendered.form, e.submitter);
        const args: Record<string, string> = {};
        for (const [k, v] of formData.entries()) {
          const vo = v.valueOf();
          if (vo instanceof File) {
            args[k] = vo.name !== '' ? `/input/${vo.name}` : '';
          } else {
            args[k] = v.toString();
          }
        }
        this.cbs.runScript(files, args);
      }
      this.transferred = false;
    } else {
      this.rendered = RenderedForm.render(this.rendered.form);
      this.transferred = true;
    }
  }

  onEvent(id: FiolinFormComponentId, ev: FiolinFormEvent) {
    // TODO: forward these up to the runner
    console.log('Event: ', id, ev);
  }

  onRun(request: FiolinRunRequest, opts: { setCanvases?: Record<string, OffscreenCanvas> }): void {
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
    // TODO: When they exist:
    // - update the output file display component.
    if (this.isEnabled() && !response.partial) {
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
    if (response?.formUpdates) {
      for (const fu of response.formUpdates) {
        this.rendered.applyUpdate(fu);
      }
    }
    this.rendered.form.inert = false;
  }
}