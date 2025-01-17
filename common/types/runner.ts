import type { PyodideInterface } from 'pyodide';
import { FiolinScript } from './fiolin-script';
import { FiolinFormComponentId } from './form';

// Used for encapsulating running a script.
export interface FiolinRunRequest {
  inputs: File[];
  args?: Record<string, string>;
  // TODO: Add a debug section
}

export type FiolinLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface FiolinRunResponse {
  outputs: File[];
  log: [FiolinLogLevel, string][];
  error?: Error;
  lineno?: number;
  partial?: boolean;
  formUpdates?: FormUpdate[];
}

export type FormUpdate = (
  { type: 'HIDDEN', id: FiolinFormComponentId, value: boolean } |
  { type: 'DISABLED', id: FiolinFormComponentId, value: boolean } |
  { type: 'FOCUS', id: FiolinFormComponentId }
  // TODO: value updates
);

export type FiolinJsGlobal = Omit<FiolinRunRequest, 'inputs'> & {
  // Inputs and outputs are filenames w/in /input and /output rather than File
  // objects.
  inputs: string[];
  outputs: string[];

  // Used to pass exceptions back to the host
  errorMsg?: string;
  errorLine?: number;

  // Used to signal that the script is not done and further interactions should
  // be allowed.
  partial?: boolean;

  // Used to signal any updates to be made to the form
  enqueueFormUpdate(update: FormUpdate): void;

  // Other properties may be temporarily needed during the loading phase.
  [key: string]: any;
}

export abstract class FiolinWasmLoader {
  pyWrapper(moduleName: string): string {
    return `import js\nfor k, v in js.${moduleName}.object_entries():\n  globals()[k] = v\n`;
  }
  abstract loadModule(pyodide: PyodideInterface): Promise<any>;
}

export class InstallPkgsError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InstallPkgsError';
  }
}

export interface FiolinRunner {
  // Install any necessary external packages to run the script. If the runner
  // has previously installed packages, then compares the requested packages to
  // those. If they're the same, installPkgs is a no-op. Otherwise, it reloads
  // the entire interpreter before installing them.
  installPkgs(script: FiolinScript): Promise<void>;

  // Run the given script. forceReload triggers a reload of the interpreter
  // before proceeding. installPkgs is triggered on runs--see above for the
  // logic about which behaviors that results in.
  run(script: FiolinScript, request: FiolinRunRequest, forceReload?: boolean): Promise<FiolinRunResponse>;
}
