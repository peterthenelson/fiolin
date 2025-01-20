import { loadPyodide, PyodideInterface } from 'pyodide';
import { FiolinJsGlobal, FiolinLogLevel, FiolinPyPackage, FiolinRunner, FiolinRunRequest, FiolinRunResponse, FiolinScript, FiolinScriptRuntime, FiolinWasmLoader, FiolinWasmModule, FormUpdate, InstallPkgsError } from './types';
import { mkDir, readFile, rmRf, toErrWithErrno, writeFile } from './emscripten-fs';
import { getFiolinPy, getWrapperPy } from './pylib';
import { cmpSet } from './cmp';
import { FiolinFormComponentMapImpl, idToComponentMap, idToRepr } from './form-utils';
import { FiolinFormComponent, FiolinFormComponentMap } from './types/form';
import { parseAs } from './parse';
import { pFormUpdate } from './parse-run';
import { resultify } from './resultify';

export interface ConsoleLike {
  debug(s: string): void;
  info(s: string): void;
  warn(s: string): void;
  error(s: string): void;
};

export interface PyodideRunnerOptions {
  console?: ConsoleLike;
  indexUrl?: string;
  loaders?: Record<string, FiolinWasmLoader>;
}

function pyPkgKey(v: FiolinPyPackage): any[] {
  return [v.type, v.name];
}

function wasmModKey(v: FiolinWasmModule): any[] {
  return [v.name];
}

function packagesDiffer(a: FiolinScriptRuntime, b: FiolinScriptRuntime): boolean {
  {
    const aPkgs: FiolinPyPackage[] = a.pythonPkgs || [];
    const bPkgs: FiolinPyPackage[] = b.pythonPkgs || [];
    if (cmpSet(aPkgs, bPkgs, pyPkgKey) !== 0) return true;
  }
  {
    const aMods: FiolinWasmModule[] = a.wasmModules || [];
    const bMods: FiolinWasmModule[] = b.wasmModules || [];
    if (cmpSet(aMods, bMods, wasmModKey) !== 0) return true;
  }
  return false;
}

export class PyodideRunner implements FiolinRunner {
  private _shared: FiolinJsGlobal;
  private _pyodide?: PyodideInterface;
  private _installed?: FiolinScriptRuntime;
  private readonly _indexUrl?: string;
  private readonly _console: ConsoleLike;
  private _log: [FiolinLogLevel, string][];
  private _formUpdates: FormUpdate[];
  private _formIds: FiolinFormComponentMap<FiolinFormComponent>;
  private _loaders: Record<string, FiolinWasmLoader>;
  public loaded: Promise<void>;

  constructor(options?: PyodideRunnerOptions) {
    this._shared = {
      inputs: [], outputs: [], args: {},
      enqueueFormUpdate: resultify((update) => this.enqueueFormUpdate(update)),
    };
    const innerConsole: ConsoleLike = options?.console || console;
    this._log = [];
    this._formUpdates = [];
    this._formIds = new FiolinFormComponentMapImpl();
    this._console = {
      debug: (s) => {
        innerConsole.debug(s);
        this._log.push(['DEBUG', s]);
      },
      info: (s) => {
        innerConsole.info(s);
        this._log.push(['INFO', s]);
      },
      warn: (s) => {
        innerConsole.warn(s);
        this._log.push(['WARN', s]);
      },
      error: (s) => {
        innerConsole.error(s);
        this._log.push(['ERROR', s]);
      }
    };
    this._indexUrl = options?.indexUrl;
    this._loaders = options?.loaders || {};
    this.loaded = this.load();
  }

  private enqueueFormUpdate(update: FormUpdate): void {
    // Value is probably from python, so we should convert and parse it.
    const o: Object = update;
    let v: unknown;
    if ('toJs' in o && typeof o.toJs === 'function') {
      v = o.toJs({ dict_converter: Object.fromEntries });
    } else {
      v = o;
    }
    update = parseAs(pFormUpdate, v);
    if (this._formIds.get(update.id)) {
      this._formUpdates.push(update);
    } else {
      throw new Error(`Could not find component with ${idToRepr(update.id)}`)
    }
  }

  private resetFs() {
    this._console.debug('Resetting FS');
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`)
    }
    rmRf(this._pyodide.FS, '/input');
    mkDir(this._pyodide.FS, '/input');
    rmRf(this._pyodide.FS, '/output');
    mkDir(this._pyodide.FS, '/output');
    rmRf(this._pyodide.FS, '/tmp');
    mkDir(this._pyodide.FS, '/tmp');
    rmRf(this._pyodide.FS, '/home/pyodide/fiolin.py');
    rmRf(this._pyodide.FS, '/home/pyodide/script.py');
  }

  private async mountInputs(script: FiolinScript, inputs: File[]) {
    if (script.interface.inputFiles === 'NONE' && inputs.length > 0) {
      throw new Error(`Script expects no input files; got ${inputs.length}`);
    } else if (script.interface.inputFiles === 'SINGLE' && inputs.length !== 1) {
      throw new Error(`Script expects one input file; got ${inputs.length}`);
    } else if (script.interface.inputFiles === 'MULTI' && inputs.length <= 1) {
      throw new Error(`Script expects multiple files; got ${inputs.length}`);
    }
    this._console.debug('Mounting inputs to /input');
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`);
    }
    this._shared.inputs = [];
    for (const input of inputs) {
      const inBytes = new Uint8Array(await input.arrayBuffer());
      this._shared.inputs.push(input.name);
      writeFile(this._pyodide.FS, `/input/${input.name}`, inBytes);
    }
    this._console.debug('Setting up python files');
    writeFile(this._pyodide.FS, `/home/pyodide/fiolin.py`, getFiolinPy(this._pyodide));
    writeFile(this._pyodide.FS, `/home/pyodide/script.py`, script.code.python);
  }

  private extractOutputs(script: FiolinScript): File[] {
    const nOutputs = this._shared.outputs.length;
    if (script.interface.outputFiles === 'NONE' && nOutputs > 0) {
      throw new Error(`Script expected to produce no output files; got ${nOutputs}`);
    } else if (script.interface.outputFiles === 'SINGLE' && nOutputs !== 1) {
      throw new Error(`Script expected to produce one output file; got ${nOutputs}`);
    } else if (script.interface.outputFiles === 'MULTI' && nOutputs <= 1) {
      throw new Error(`Script expected to produce multiple files; got ${nOutputs}`);
    }
    this._console.debug('Extracting outputs from /output');
    if (nOutputs === 0) {
      this._console.debug('Script did not produce an output file.');
    }
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present before resetFs!`)
    }
    const outFiles: File[] = [];
    for (const output of this._shared.outputs) {
      const outBytes = readFile(this._pyodide.FS, `/output/${output}`);
      outFiles.push(new File([new Blob([outBytes])], output));
    }
    return outFiles;
  }

  private resetShared() {
    this._shared.inputs = [];
    this._shared.outputs = [];
    this._shared.errorMsg = undefined;
    this._shared.errorLine = undefined;
    this._shared.partial = undefined;
    this._shared.args = {};
  }

  private async load() {
    this._pyodide = await loadPyodide({
      indexURL: this._indexUrl,
      jsglobals: this._shared,
    });
    this._pyodide.setStdout({ batched: (s) => { this._console.info(s) } });
    this._pyodide.setStderr({ batched: (s) => { this._console.error(s) } });
    this._console.debug('Pyodide Loaded');
  }

  async installPkgs(script: FiolinScript) {
    await this.loaded;
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present after loading!`)
    }
    const pkgs: FiolinPyPackage[] = script.runtime.pythonPkgs || [];
    const mods: FiolinWasmModule[] = script.runtime.wasmModules || [];
    if (pkgs.length === 0 && mods.length === 0) {
      this._console.debug('No packages/modules to be installed');
      return;
    }
    if (typeof this._installed !== 'undefined') {
      if (packagesDiffer(this._installed, script.runtime)) {
        this._console.debug(
          'Required packages/modules differ from those installed; reloading pyodide');
        this.loaded = this.load();
        await this.loaded;
      } else {
        this._console.debug('Required packages/modules already installed')
        return;
      }
    }
    try {
      this._console.debug(`${pkgs.length} python packages to be installed`);
      this._shared['Object'] = Object;
      this._shared['fetch'] = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        this._console.debug(`micropip fetching ${input}`);
        return fetch(input, init);
      }
      await this._pyodide.loadPackage('micropip');
      const micropip = this._pyodide.pyimport('micropip');
      for (const pkg of pkgs) {
        if (pkg.type === 'PYPI') {
          this._console.debug(`Installing package ${pkg.name}`);
          try {
            await micropip.install(pkg.name, { deps: true });
          } catch (cause) {
            throw new InstallPkgsError('Failed to install package', { cause });
          }
        } else {
          throw new InstallPkgsError(`Unknown package type: ${pkg.type}`);
        }
      }
      this._console.debug(`${mods.length} wasm modules to be installed`);
      for (const mod of mods) {
        if (mod.name in this._loaders) {
          this._console.debug(`Installing module ${mod.name}`);
          const pystub = this._loaders[mod.name].pyWrapper(mod.name);
          writeFile(this._pyodide.FS, `/home/pyodide/${mod.name}.py`, pystub);
          try {
            this._shared[mod.name] = await this._loaders[mod.name].loadModule(this._pyodide);
          } catch (cause) {
            throw new InstallPkgsError('Failed to install module', { cause });
          }
        } else {
          throw new InstallPkgsError(`Unknown module: ${mod.name}`);
        }
      }
      this._console.debug(`Finished installing packages/modules`);
      this._installed = structuredClone(script.runtime);
    } finally {
      this._shared['Object'] = undefined;
      this._shared['fetch'] = undefined;
    }
  }

  async run(script: FiolinScript, request: FiolinRunRequest, forceReload?: boolean): Promise<FiolinRunResponse> {
    await this.loaded;
    if (!this._pyodide) {
      throw new Error(`this._pyodide should be present after loading!`)
    }
    if (forceReload) {
      this._console.debug('Reloading interpreter');
      this.loaded = this.load();
      await this.loaded;
    }
    this._log = [];
    this.resetShared();
    Object.assign(this._shared.args!, request.args || {});
    try {
      this._formUpdates = [];
      if (script.interface.form) {
        this._formIds = idToComponentMap(script.interface.form);
      } else {
        this._formIds = new FiolinFormComponentMapImpl();
      }
      await this.installPkgs(script);
      await this._pyodide.loadPackagesFromImports(script.code.python);
      this.resetFs();
      await this.mountInputs(script, request.inputs);
      this._console.debug('Executing script.py');
      await this._pyodide.runPythonAsync(getWrapperPy());
      if (this._shared.errorMsg) {
        return {
          outputs: [], log: this._log,
          error: new Error(this._shared.errorMsg), lineno: this._shared.errorLine,
          partial: this._shared.partial, formUpdates: this._formUpdates,
        };
      }
      const outputs = this.extractOutputs(script);
      return {
        outputs, log: this._log,
        partial: this._shared.partial, formUpdates: this._formUpdates,
      };
    } catch (e) {
      const error = toErrWithErrno(e);
      return {
        outputs: [], log: this._log, error,
        partial: this._shared.partial, formUpdates: this._formUpdates,
      };
    }
  }
}
