import { FiolinScript } from '../common/types';
import { FormComponent } from './form-component';

// Multiple forms together, with events delegated to all of them.
export class CombinedForm extends FormComponent {
  private readonly forms: FormComponent[];

  constructor(forms: FormComponent[]) {
    super();
    this.forms = forms;
  }

  reportValidity(): boolean {
    // Note: we don't want short-circuiting; we want to trigger them all.
    const validities = this.forms.map((f) => f.reportValidity());
    return validities.every((b) => b);
  }

  onLoad(script: FiolinScript): void {
    this.forms.forEach((f) => f.onLoad(script));
  }

  onRun(inputs: File[], formData?: FormData): void {
    this.forms.forEach((f) => f.onRun(inputs, formData));
  }

  onSuccess(outputs: File[]): void {
    this.forms.forEach((f) => f.onSuccess(outputs));
  }

  onError(): void {
    this.forms.forEach((f) => f.onError());
  }
}
