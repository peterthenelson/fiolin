import { FiolinScript, FiolinScriptInterface } from '../common/types';
import { FiolinFormButtonAction } from '../common/types/form';
import { getByRelIdAs } from '../web-utils/select-as';
import { FormComponent } from './form-component';
import { renderForm } from './form-renderer';

export interface CustomFormCallbacks {
  runScript(files: File[], formData?: FormData): Promise<void>;
  // TODO: Remove these once decoupled from SimpleForm
  getFiles(): File[];
  clickFileChooser(button: HTMLButtonElement, action: FiolinFormButtonAction): void;
}

export class CustomForm extends FormComponent {
  private readonly container: HTMLElement;
  private form: HTMLFormElement;
  private readonly cbs: CustomFormCallbacks;
  private ui?: FiolinScriptInterface;

  constructor(container: HTMLElement, callbacks: CustomFormCallbacks) {
    super();
    this.container = container;
    this.form = getByRelIdAs(container, 'script-form', HTMLFormElement);
    this.cbs = callbacks;
    // Disable it until the script is set.
    this.form.onsubmit = (e) => e.preventDefault();
  }

  reportValidity(): boolean {
    return this.form.reportValidity();
  }

  onLoad(script: FiolinScript): void {
    this.ui = script.interface;
    let newForm: HTMLFormElement;
    if (this.ui.form) {
      newForm = renderForm(this.ui.form, (button, action) => {
        // TODO: remove onced decoupled from SimpleForm
        this.cbs.clickFileChooser(button, action);
      });
      if (this.ui.form.hideFileChooser) {
        this.container.classList.add('file-chooser-hidden');
      } else {
        this.container.classList.remove('file-chooser-hidden');
      }
      newForm.onsubmit = (e) => {
        e.preventDefault();
        const files = this.cbs.getFiles();
        this.cbs.runScript(files, new FormData(this.form, e.submitter));
      }
    } else {
      newForm = document.createElement('form');
    }
    this.form.replaceWith(newForm);
    this.form = newForm;
  }

  onRun(inputs: File[], formData?: FormData): void {
    // TODO: When they exist:
    // - disable submit buttons of any sort
    // - reset file/run component values
    // - reset the output file display component.
  }

  onSuccess(outputs: File[]): void {
    // TODO: When they exists:
    // - reenable submit buttons of any sort
    // - update the output file display component.
  }

  onError(): void {
    // TODO: When they exist:
    // - reenable submit buttons of any sort
  }

  // TODO: Remove when this is decoupled from SimpleForm
  requestSubmit(submitter: HTMLElement) {
    this.form.requestSubmit(submitter);
  }

  // TODO: Remove when possible
  getFormData(): FormData {
    return new FormData(this.form);
  }
}