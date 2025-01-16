import { FiolinScript, FiolinScriptInterface } from '../../common/types';
import { getByRelIdAs, selectAllAs } from '../../web-utils/select-as';
import { FormComponent } from './form-component';
import { RenderedForm, renderForm } from './form-renderer';

export interface CustomFormCallbacks {
  runScript(files: File[], args?: Record<string, string>): Promise<void>;
  downloadFile(file: File): void;
}

export class CustomForm extends FormComponent {
  private rendered: RenderedForm;
  private readonly cbs: CustomFormCallbacks;
  private ui?: FiolinScriptInterface;

  constructor(container: HTMLElement, callbacks: CustomFormCallbacks) {
    super();
    this.rendered = { form: getByRelIdAs(container, 'script-form', HTMLFormElement), uniquelyIdentifiedElems: {} };
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
    let newForm: RenderedForm;
    if (this.ui.form) {
      newForm = renderForm(this.ui);
      newForm.form.onsubmit = (e) => {
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
    } else {
      newForm = { form: document.createElement('form'), uniquelyIdentifiedElems: {} };
    }
    this.rendered.form.replaceWith(newForm.form);
    this.rendered = newForm;
  }

  onRun(inputs: File[], args?: Record<string, string>): void {
    // TODO: When they exist:
    // - disable submit buttons of any sort
    // - reset file/run component values
    // - reset the output file display component.
  }

  onSuccess(outputs: File[], partial?: boolean): void {
    // TODO: When they exists:
    // - reenable submit buttons of any sort
    // - update the output file display component.
    if (this.isEnabled() && !partial) {
      for (const f of outputs) {
        this.cbs.downloadFile(f);
      }
    }
  }

  onError(): void {
    // TODO: When they exist:
    // - reenable submit buttons of any sort
  }
}