import { FiolinRunRequest, FiolinRunResponse, FiolinScript } from '../../common/types';

export interface FormCallbacks {
  runScript(files: File[], args?: Record<string, string>): Promise<void>;
  downloadFile(file: File): void;
}

// Abstraction over different types of forms (for choosing files and invoking
// FiolinScripts).
export abstract class FormComponent {
  // Check for validity (of form choices) and update the UI to report any
  // issues.
  abstract reportValidity(): boolean;

  // Update the UI given the newly loaded FiolinScript.
  abstract onLoad(script: FiolinScript): void;

  // Update the UI in preparation for the imminent run of the script.
  abstract onRun(request: FiolinRunRequest): void;

  // Update the UI after a successful run of the script.
  abstract onSuccess(response: FiolinRunResponse): void;

  // Update the UI after an error occurs (could occur at different parts of the
  // lifecycle of running a script).
  abstract onError(response?: FiolinRunResponse): void;
}
