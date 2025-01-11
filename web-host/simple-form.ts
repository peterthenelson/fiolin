import { typeSwitch } from '../common/type-switch';
import { FiolinScript, FiolinScriptInterface } from '../common/types';
import { FiolinFormButtonAction } from '../common/types/form';
import { getByRelIdAs } from '../web-utils/select-as';
import { FormComponent } from './form-component';

export interface SimpleFormCallbacks {
  runScript(files: File[], formData?: FormData): Promise<void>;
  // TODO: Remove this once the custom form uses its own file chooser
  requestSubmit(submitter: HTMLElement): void;
}

// Default UI has a file chooser that doubles as a run button.
export class SimpleForm extends FormComponent {
  private readonly fileChooser: HTMLInputElement;
  private runTrigger?: [HTMLButtonElement, FiolinFormButtonAction];
  private readonly inputFileText: HTMLSpanElement;
  private readonly outputFileText: HTMLSpanElement;
  private ui?: FiolinScriptInterface;
  private readonly cbs: SimpleFormCallbacks;

  constructor(container: HTMLElement, callbacks: SimpleFormCallbacks) {
    super();
    this.fileChooser = getByRelIdAs(container, 'input-files-chooser', HTMLInputElement);
    this.inputFileText = getByRelIdAs(container, 'input-files-text', HTMLSpanElement);
    this.outputFileText = getByRelIdAs(container, 'output-files-text', HTMLSpanElement);
    this.cbs = callbacks;
    // Disable it until the script is set.
    this.fileChooser.onclick = (e) => { e.preventDefault() };
  }

  reportValidity(): boolean { return true; }
  
  onLoad(script: FiolinScript) {
    this.ui = script.interface;
    if (this.ui.inputFiles === 'NONE' || this.ui.inputFiles === 'SINGLE') {
      this.fileChooser.multiple = false;
    } else {
      this.fileChooser.multiple = true;
    }
    this.setInputFileText([]);
    this.fileChooser.accept = this.ui.inputAccept || '';
    this.runTrigger = undefined;
    this.fileChooser.oncancel = () => {
      if (this.ui && this.ui.inputFiles === 'ANY') {
        this.cbs.runScript([]);
      }
    }
    this.fileChooser.onclick = (event) => {
      // If the chooser is hidden, then the click must have been from a form
      // button (which will handle running the script if needed). Otherwise
      // skip file choosing and directly run it if inputFiles is 'NONE'.
      if (this.ui && !this.ui.form?.hideFileChooser && this.ui.inputFiles === 'NONE') {
        event.preventDefault();
        this.cbs.runScript([]);
      }
    };
    this.fileChooser.onchange = () => {
      const files = this.getFiles();
      this.setInputFileText(files);
      if (!this.runTrigger) {
        this.cbs.runScript(files);
      } else if (this.runTrigger[1] === 'FILE') {
        // Skip submission
      } else {
        this.cbs.requestSubmit(this.runTrigger[0]);
      }
    }
    this.fileChooser.disabled = false;
  }

  onRun(inputs: File[], formData?: FormData) {
    this.fileChooser.disabled = true;
    // File input components' behavior is a bit tricky. onchange will not fire
    // if the same file is chosen as before. In order to remedy this, it is
    // desirable to clear the file chooser's value on runs. However, this is
    // only the case when the file chooser itself or a form button is being used
    // to both select a file *and* trigger the run. Otherwise, we'd like to
    // retain the files (e.g., if there are separate "Choose File" and "Run"
    // buttons).
    if (!this.runTrigger || this.runTrigger[1] === 'FILE_AND_SUBMIT') {
      this.fileChooser.value = '';
    }
    this.outputFileText.title = '';
    this.outputFileText.textContent = '';
  }

  onSuccess(outputs: File[]) {
    this.fileChooser.disabled = false;
    this.outputFileText.textContent = outputs.map((f) => f.name).join();
    this.outputFileText.title = outputs.map((f) => f.name).join();
  }

  onError() {
    this.fileChooser.disabled = false;
  }

  // TODO: Make this private once the custom form uses its own file chooser
  getFiles(): File[] {
    const files: File[] = [];
    if (this.fileChooser.files !== null) {
      for (const f of this.fileChooser.files) {
        files.push(f);
      }
    }
    return files;
  }

  private setInputFileText(files: File[]) {
    if ((files === null || files.length === 0) && this.ui) {
      const txt: string = typeSwitch({ type: this.ui.inputFiles }, {
        'NONE': (_) => '',
        'SINGLE': (_) => 'Choose File',
        'MULTI': (_) => 'Choose Files',
        'ANY': (_) => 'Choose File(s)',
      });
      this.inputFileText.title = txt;
      this.inputFileText.textContent = txt;
    } else {
      const fstring = files.map((f) => f.name).join(', ');
      this.inputFileText.title = fstring;
      this.inputFileText.textContent = fstring;
    }
  }

  // TODO: Remove this once the custom form uses its own file chooser
  clickFileChooser(button: HTMLButtonElement, action: FiolinFormButtonAction) {
    this.runTrigger = [button, action];
    this.fileChooser.click();
  }
}
