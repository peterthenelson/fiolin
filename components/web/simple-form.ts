import { typeSwitch } from '../../common/type-switch';
import { FiolinScript, FiolinScriptInterface } from '../../common/types';
import { getByRelIdAs } from '../../web-utils/select-as';
import { FormCallbacks, FormComponent } from './form-component';

// Default UI has a file chooser that doubles as a run button.
export class SimpleForm extends FormComponent {
  private readonly container: HTMLElement;
  private readonly fileChooser: HTMLInputElement;
  private readonly inputFileText: HTMLSpanElement;
  private readonly outputFileText: HTMLSpanElement;
  private ui?: FiolinScriptInterface;
  private readonly cbs: FormCallbacks;

  constructor(container: HTMLElement, callbacks: FormCallbacks) {
    super();
    this.container = container;
    this.fileChooser = getByRelIdAs(container, 'input-files-chooser', HTMLInputElement);
    this.inputFileText = getByRelIdAs(container, 'input-files-text', HTMLSpanElement);
    this.outputFileText = getByRelIdAs(container, 'output-files-text', HTMLSpanElement);
    this.cbs = callbacks;
    // Disable it until the script is set.
    this.fileChooser.onclick = (e) => { e.preventDefault() };
  }

  private isEnabled(): boolean {
    return !(this.ui && this.ui.form);
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
    this.fileChooser.oncancel = () => {
      if (this.ui && this.ui.inputFiles === 'ANY') {
        this.cbs.runScript([]);
      }
    }
    this.fileChooser.onclick = (event) => {
      if (this.ui && this.ui.inputFiles === 'NONE') {
        event.preventDefault();
        this.cbs.runScript([]);
      }
    };
    this.fileChooser.onchange = () => {
      const files = this.getFiles();
      this.setInputFileText(files);
      this.cbs.runScript(files);
    }
    this.fileChooser.disabled = false;
    if (this.ui.form) {
      this.container.classList.add('file-chooser-hidden');
    } else {
      this.container.classList.remove('file-chooser-hidden');
    }
  }

  onRun(inputs: File[], args?: Record<string, string>) {
    this.fileChooser.disabled = true;
    this.fileChooser.value = '';
    this.outputFileText.title = '';
    this.outputFileText.textContent = '';
  }

  onSuccess(outputs: File[]) {
    this.fileChooser.disabled = false;
    this.outputFileText.textContent = outputs.map((f) => f.name).join();
    this.outputFileText.title = outputs.map((f) => f.name).join();
    if (this.isEnabled()) {
      for (const f of outputs) {
        this.cbs.downloadFile(f);
      }
    }
  }

  onError() {
    this.fileChooser.disabled = false;
  }

  private getFiles(): File[] {
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
}
