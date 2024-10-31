import { loadPyodide, PyodideInterface } from 'pyodide';
import { FiolinJsGlobal, FiolinRunner, FiolinRunRequest, FiolinRunResponse, FiolinScript } from './types';
import { toErr } from './errors';

export interface ConsoleLike { log(s: string): void, error(s: string): void };

export interface PyodideRunnerOptions {
  console?: ConsoleLike;
  indexUrl?: string;
}

export class PyodideRunner implements FiolinRunner {
  private _shared: FiolinJsGlobal;
  private _pyodide?: PyodideInterface;
  private readonly _console: ConsoleLike;
  private _stdout: string;
  private _stderr: string;
  public loaded: Promise<void>;

  constructor(options?: PyodideRunnerOptions) {
    this._shared = { inputs: [], outputs: [], argv: '' };
    this.loaded = this.load(options);
    this._console = options?.console || console;
    this._stdout = '';
    this._stderr = '';
  }

  // TODO: Where should I be dealing w/errno codes in these functions?
  resetFs() {
    this._console.log('Resetting FS');
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`)
    }
    // TODO: Actually delete everything in the filesystem
    this._pyodide.FS.mkdir('/input');
    this._pyodide.FS.mkdir('/output');
  }

  private async mountInputs(inputs: File[]) {
    this._console.log('Mounting inputs to /input');
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`)
    }
    this._shared.inputs = [];
    for (const input of inputs) {
      const inBytes = new Uint8Array(await input.arrayBuffer());
      this._shared.inputs.push(input.name);
      this._pyodide.FS.writeFile(`/input/${input.name}`, inBytes);
    }
  }

  private extractOutputs(): File[] {
    this._console.log('Extracting outputs from /output');
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`)
    }
    const outFiles: File[] = [];
    for (const output of this._shared.outputs) {
      const outBytes = this._pyodide.FS.readFile(`/output/${output}`);
      outFiles.push(new File([new Blob([outBytes])], output));
    }
    return outFiles;
  }

  private resetShared() {
    this._shared.inputs = [];
    this._shared.outputs = [];
    this._shared.argv = '';
  }

  private async load(options?: PyodideRunnerOptions) {
    this._pyodide = await loadPyodide({
      indexURL: options?.indexUrl,
      jsglobals: this._shared,
    });
    this._pyodide.setStdout({
      batched: (s) => { this._console.log(s); this._stdout += s + '\n' }
    });
    this._pyodide.setStderr({
      batched: (s) => { this._console.error(s); this._stderr += s + '\n' }
    });
  }

  // TODO: Add checking for NONE/SINGLE/MULTI
  async run(script: FiolinScript, request: FiolinRunRequest): Promise<FiolinRunResponse> {
    await this.loaded;
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present after loading!`)
    }
    this._stdout = '';
    this._stderr = '';
    this.resetShared();
    this._shared.argv = request.argv;
    try {
      this.resetFs();
      await this.mountInputs(request.inputs);
      await this._pyodide.loadPackagesFromImports(script.code.python);
      await this._pyodide.runPythonAsync(script.code.python);
      const response: FiolinRunResponse = {
        outputs: this.extractOutputs(),
        stdout: this._stdout,
        stderr: this._stderr,
      };
      return response;
    } catch (e) {
      return { outputs: [], stdout: this._stdout, stderr: this._stderr, error: toErr(e) };
    }
  }
}