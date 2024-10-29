import { loadPyodide, PyodideInterface } from 'pyodide';
import { resetShared } from '../common/shared';
import { FiolinJsGlobal, FiolinRunner, FiolinRunRequest, FiolinRunResponse, FiolinScript } from '../common/types';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

interface FakeConsole { log(s: string): void, error(s: string): void };

// NOTE: Figure out how much logic, if any, to share w/worker and extract it to shared.ts.
export class PyodideRunner implements FiolinRunner {
  private _shared: FiolinJsGlobal;
  private _loaded: Promise<void>;
  private _pyodide?: PyodideInterface;
  private readonly _script: FiolinScript;
  private readonly _console: FakeConsole;
  private _stdout: string;
  private _stderr: string;

  constructor(script: FiolinScript, console?: FakeConsole) {
    this._shared = { inFileName: null, outFileName: null, argv: null };
    this._loaded = this.load();
    this._script = script;
    this._console = console || { log(s: string) {}, error(s: string) {} };
    this._stdout = '';
    this._stderr = '';
  }

  async load() {
    this._pyodide = await loadPyodide({ jsglobals: this._shared });
    this._pyodide.setStdout({ batched: (s) => { this._console.log(s); this._stdout += s + '\n' } });
    this._pyodide.setStderr({ batched: (s) => { this._console.error(s); this._stderr += s + '\n' } });
    // TODO: Where should I be dealing w/errno codes?
    this._pyodide.FS.mkdir('/input');
    this._pyodide.FS.mkdir('/output');
  }

  async run(request: FiolinRunRequest, onComplete: (response: FiolinRunResponse) => void) {
    await this._loaded;
    this._stdout = '';
    this._stderr = '';
    resetShared(this._shared);
    this._shared.argv = request.argv;
    try {
      if (request.inputs.length > 1) {
        throw new Error(`Expected at most one input; got ${request.inputs}`);
      } else if (request.inputs.length === 1) {
        this._shared.inFileName = path.basename(request.inputs[0]);
        const inBytes = readFileSync(request.inputs[0]);
        this._pyodide!.FS.writeFile(`/input/${this._shared.inFileName}`, inBytes);
      }
      await this._pyodide!.loadPackagesFromImports(this._script.code.python);
      await this._pyodide!.runPythonAsync(this._script.code.python);
      const response: FiolinRunResponse = {
        outputs: [],
        stdout: this._stdout,
        stderr: this._stderr,
      };
      if (this._shared.outFileName) {
        response.outputs.push(this._shared.outFileName);
        const outBytes = this._pyodide!.FS.readFile(`/output/${this._shared.outFileName}`);
        writeFileSync(path.join(request.outputDir, this._shared.outFileName), outBytes);
      }
      onComplete(response);
    } catch (e) {
      let err: Error | undefined = e instanceof Error ? e : undefined;
      onComplete({ outputs: [], stdout: this._stdout, stderr: this._stderr, error: err });
    }
  }
}
