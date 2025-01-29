import { FiolinRunRequest, FiolinRunResponse, FiolinScript } from '../../common/types';
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

  onRun(request: FiolinRunRequest, opts: { setCanvases?: Record<string, OffscreenCanvas> }): void {
    this.forms.forEach((f) => f.onRun(request, opts));
  }

  onSuccess(response: FiolinRunResponse): void {
    this.forms.forEach((f) => f.onSuccess(response));
  }

  onError(response?: FiolinRunResponse): void {
    this.forms.forEach((f) => f.onError(response));
  }
}
