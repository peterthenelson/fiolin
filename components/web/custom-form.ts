import { FiolinScript, FiolinScriptInterface } from '../../common/types';
import { getByRelIdAs, selectAllAs } from '../../web-utils/select-as';
import { FormComponent } from './form-component';
import { renderForm } from './form-renderer';

export interface CustomFormCallbacks {
  runScript(files: File[], args?: Record<string, string>): Promise<void>;
  downloadFile(file: File): void;
}

export class CustomForm extends FormComponent {
  private form: HTMLFormElement;
  private readonly cbs: CustomFormCallbacks;
  private ui?: FiolinScriptInterface;

  constructor(container: HTMLElement, callbacks: CustomFormCallbacks) {
    super();
    this.form = getByRelIdAs(container, 'script-form', HTMLFormElement);
    this.cbs = callbacks;
    // Disable it until the script is set.
    this.form.onsubmit = (e) => e.preventDefault();
  }

  private isEnabled(): boolean {
    return !!(this.ui && this.ui.form);
  }

  reportValidity(): boolean {
    return this.form.reportValidity();
  }

  onLoad(script: FiolinScript): void {
    this.ui = script.interface;
    let newForm: HTMLFormElement;
    if (this.ui.form) {
      newForm = renderForm(this.ui);
      newForm.onsubmit = (e) => {
        e.preventDefault();
        const files: File[] = [];
        for (const fileChooser of selectAllAs(this.form, 'input[type="file"]', HTMLInputElement)) {
          if (fileChooser.files !== null) {
            for (const f of fileChooser.files) {
              files.push(f);
            }
          }
        }
        const formData = new FormData(this.form, e.submitter);
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
      newForm = document.createElement('form');
    }
    this.form.replaceWith(newForm);
    this.form = newForm;
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