import { FiolinFormComponentMapImpl, idToRepr } from '../../common/form-utils';
import { typeSwitch } from '../../common/tagged-unions';
import { FiolinRunRequest, FiolinRunResponse, FiolinScript, FiolinScriptInterface, FormUpdate } from '../../common/types';
import { getByRelIdAs, selectAllAs } from '../../web-utils/select-as';
import { setSelected } from '../../web-utils/set-selected';
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
    this.rendered = {
      form: getByRelIdAs(container, 'script-form', HTMLFormElement),
      uniquelyIdentifiedElems: new FiolinFormComponentMapImpl()
    };
    this.cbs = callbacks;
    // Disable it until the script is set.
    this.rendered.form.onsubmit = (e) => e.preventDefault();
  }

  private isEnabled(): boolean {
    return !!(this.ui && this.ui.form);
  }

  private applyUpdate(formUpdate: FormUpdate) {
    const e = this.rendered.uniquelyIdentifiedElems.get(formUpdate.id);
    if (!e) {
      throw new Error(`Cannot find element with ${idToRepr(formUpdate.id)}`);
    }
    typeSwitch(formUpdate, {
      'HIDDEN': (fu) => {
        if (fu.value) {
          e.classList.add('hidden');
        } else {
          e.classList.remove('hidden');
        }
      },
      'DISABLED': (fu) => {
        if (e instanceof HTMLInputElement || e instanceof HTMLSelectElement || e instanceof HTMLButtonElement) {
          e.disabled = fu.value;
        } else {
          console.warn(`${e} does not have have .disabled property`);
        }
      },
      'FOCUS': () => {
        e.focus();
      },
      'VALUE': (fu) => {
        if (e instanceof HTMLInputElement || e instanceof HTMLOutputElement || e instanceof HTMLButtonElement) {
          e.value = fu.value;
        } else if (e instanceof HTMLSelectElement) {
          setSelected(e, fu.value);
        } else {
          console.warn(`${e} does not have have .value property`);
        }
      }
    })
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
      newForm = {
        form: document.createElement('form'),
        uniquelyIdentifiedElems: new FiolinFormComponentMapImpl(), 
      };
    }
    this.rendered.form.replaceWith(newForm.form);
    this.rendered = newForm;
  }

  onRun(request: FiolinRunRequest): void {
    // TODO: When they exist:
    // - disable submit buttons of any sort
    // - reset file/run component values
    // - reset the output file display component.
  }

  onSuccess(response: FiolinRunResponse): void {
    // TODO: When they exists:
    // - reenable submit buttons of any sort
    // - update the output file display component.
    if (this.isEnabled() && !response.partial) {
      for (const f of response.outputs) {
        this.cbs.downloadFile(f);
      }
    }
    if (response.formUpdates) {
      for (const fu of response.formUpdates) {
        this.applyUpdate(fu);
      }
    }
  }

  onError(response?: FiolinRunResponse): void {
    // TODO: When they exist:
    // - reenable submit buttons of any sort
    if (response?.formUpdates) {
      for (const fu of response.formUpdates) {
        this.applyUpdate(fu);
      }
    }
  }
}