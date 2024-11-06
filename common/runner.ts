import { loadPyodide, PyodideInterface } from 'pyodide';
import { FiolinJsGlobal, FiolinPyPackage, FiolinRunner, FiolinRunRequest, FiolinRunResponse, FiolinScript, FiolinScriptRuntime } from './types';
import { mkDir, readFile, rmRf, toErrWithErrno, writeFile } from './emscripten-fs';
import { getPyLib } from './pylib';

export interface ConsoleLike { log(s: string): void, error(s: string): void };

export interface PyodideRunnerOptions {
  console?: ConsoleLike;
  indexUrl?: string;
}

function cmpPkg(a: FiolinPyPackage, b: FiolinPyPackage): number {
  if (a.type < b.type) {
    return -1;
  } else if (a.type > b.type) {
    return 1;
  } else if (a.name < b.name) {
    return -1
  } else if (a.name > b.name) {
    return 1;
  } else {
    return 0;
  }
}

function packagesDiffer(a: FiolinScriptRuntime, b: FiolinScriptRuntime): boolean {
  const aPkgs: FiolinPyPackage[] = a.pythonPkgs || [];
  const bPkgs: FiolinPyPackage[] = b.pythonPkgs || [];
  if (aPkgs.length !== bPkgs.length) return true;
  aPkgs.sort(cmpPkg);
  bPkgs.sort(cmpPkg);
  for (let i = 0; i < aPkgs.length; i++) {
    if (cmpPkg(aPkgs[i], bPkgs[i]) !== 0) {
      return true;
    }
  }
  return false;
}

export class PyodideRunner implements FiolinRunner {
  private _shared: FiolinJsGlobal;
  private _pyodide?: PyodideInterface;
  private _installed?: FiolinScriptRuntime;
  private readonly _indexUrl?: string;
  private readonly _console: ConsoleLike;
  private _stdout: string;
  private _stderr: string;
  public loaded: Promise<void>;

  constructor(options?: PyodideRunnerOptions) {
    this._shared = { inputs: [], outputs: [], argv: '' };
    const innerConsole: ConsoleLike = options?.console || console;
    this._stdout = '';
    this._stderr = '';
    this._console = {
      log: (s) => {
        innerConsole.log(s);
        this._stdout += s + '\n';
      },
      error: (s) => {
        innerConsole.error(s);
        this._stderr += s + '\n';
      }
    };
    this._indexUrl = options?.indexUrl;
    this.loaded = this.load();
  }

  private resetFs() {
    this._console.log('Resetting FS');
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`)
    }
    rmRf(this._pyodide, '/input');
    mkDir(this._pyodide, '/input');
    rmRf(this._pyodide, '/output');
    mkDir(this._pyodide, '/output');
    rmRf(this._pyodide, '/home/pyodide/fiolin.py');
  }

  private async mountInputs(script: FiolinScript, inputs: File[]) {
    if (script.interface.inputFiles === 'NONE' && inputs.length > 0) {
      throw new Error(`Script expects no input files; got ${inputs.length}`);
    } else if (script.interface.inputFiles === 'SINGLE' && inputs.length !== 1) {
      throw new Error(`Script expects one input file; got ${inputs.length}`);
    }
    this._console.log('Mounting inputs to /input');
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`);
    }
    this._shared.inputs = [];
    for (const input of inputs) {
      const inBytes = new Uint8Array(await input.arrayBuffer());
      this._shared.inputs.push(input.name);
      writeFile(this._pyodide, `/input/${input.name}`, inBytes);
    }
    this._console.log('Setting up utility library');
    writeFile(this._pyodide, `/home/pyodide/fiolin.py`, getPyLib(this._pyodide));
  }

  private extractOutputs(script: FiolinScript): File[] {
    const nOutputs = this._shared.outputs.length;
    if (script.interface.outputFiles === 'NONE' && nOutputs > 0) {
      throw new Error(`Script expected to produce no output files; got ${nOutputs}`);
    } else if (script.interface.outputFiles === 'SINGLE' && nOutputs !== 1) {
      throw new Error(`Script expected to produce one output file; got ${nOutputs}`);
    }
    this._console.log('Extracting outputs from /output');
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`)
    }
    const outFiles: File[] = [];
    for (const output of this._shared.outputs) {
      const outBytes = readFile(this._pyodide, `/output/${output}`);
      outFiles.push(new File([new Blob([outBytes])], output));
    }
    return outFiles;
  }

  private resetShared() {
    this._shared.inputs = [];
    this._shared.outputs = [];
    this._shared.argv = '';
  }

  private async load() {
    this._pyodide = await loadPyodide({
      indexURL: this._indexUrl,
      jsglobals: this._shared,
    });
    this._pyodide.setStdout({ batched: (s) => { this._console.log(s) } });
    this._pyodide.setStderr({ batched: (s) => { this._console.error(s) } });
  }

  async installPkgs(script: FiolinScript) {
    await this.loaded;
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present after loading!`)
    }
    const pkgs: FiolinPyPackage[] = script.runtime.pythonPkgs || [];
    if (pkgs.length === 0) {
      this._console.log('No packages to be installed');
      return;
    }
    if (typeof this._installed !== 'undefined') {
      if (packagesDiffer(this._installed, script.runtime)) {
        this._console.log(
          'Required packages differ from those installed; reloading pyodide');
        this.loaded = this.load();
        await this.loaded;
      } else {
        this._console.log('Required packages already installed')
        return;
      }
    }
    try {
      this._console.log(`${pkgs.length} python packages to be installed`);
      this._shared['Object'] = Object;
      this._shared['fetch'] = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        this._console.log(`micropip fetching ${input}`);
        return fetch(input, init);
      }
      await this._pyodide.loadPackage('micropip');
      const micropip = this._pyodide.pyimport('micropip');
      for (const pkg of (script.runtime.pythonPkgs || [])) {
        if (pkg.type === 'PYPI') {
          this._console.log(`Installing package ${pkg.name}`);
          await micropip.install(pkg.name, { deps: true });
        } else {
          throw new Error(`Unknown package type: ${pkg.type}`);
        }
      }
      this._console.log(`Finished installing packages`);
      this._installed = structuredClone(script.runtime);
    } finally {
      this._shared['Object'] = undefined;
      this._shared['fetch'] = undefined;
    }
  }

  private translateError(e: unknown): [Error, number | undefined] {
    const err = toErrWithErrno(e);
    if (err instanceof this._pyodide!.ffi.PythonError) {
      const prox = this._pyodide!.runPython('import fiolin; fiolin.extract_exc()');
      const [lineno, msg] = prox;
      prox.destroy();
      return [new Error(msg), lineno];
    }
    return [err, undefined];
  }

  async run(script: FiolinScript, request: FiolinRunRequest, forceReload?: boolean): Promise<FiolinRunResponse> {
    await this.loaded;
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present after loading!`)
    }
    if (forceReload) {
      this._console.log('Reloading interpreter');
      this.loaded = this.load();
      await this.loaded;
    }
    this._stdout = '';
    this._stderr = '';
    this.resetShared();
    this._shared.argv = request.argv;
    try {
      this.resetFs();
      await this.installPkgs(script);
      await this._pyodide.loadPackagesFromImports(script.code.python);
      await this.mountInputs(script, request.inputs);
      await this._pyodide.runPythonAsync(script.code.python);
      const outputs = this.extractOutputs(script);
      const response: FiolinRunResponse = {
        outputs, stdout: this._stdout, stderr: this._stderr,
      };
      return response;
    } catch (e) {
      const [error, lineno] = this.translateError(e);
      return {
        outputs: [], stdout: this._stdout, stderr: this._stderr, error, lineno
      };
    }
  }
}
