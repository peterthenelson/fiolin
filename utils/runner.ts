import { PyodideRunner } from '../common/runner';
import { FiolinRunRequest, FiolinScript } from '../common/types';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pkgPath } from './pkg-path';
import { loadScript } from './config';
import { offlineWasmLoaders } from './loaders';

// Convenience wrapper around PyodideRunner that reads input paths to Files and
// write the output Files into the given directory.
export class NodeFiolinRunner {
  public readonly script: FiolinScript;
  public readonly outputDir: string;
  private readonly _runner: PyodideRunner;

  constructor(fiolName: string, outputDir: string) {
    this.script = loadScript(fiolName);
    this.outputDir = outputDir;
    // For some mysterious reason the indexUrl is needed but only in tests. But
    // it doesn't seem to break the run command, so whatever.
    this._runner = new PyodideRunner({
      indexUrl: pkgPath('node_modules/pyodide'),
      loaders: offlineWasmLoaders(),
    });
  }

  async runWithLocalFs(inputPaths: string[], requestOther: Omit<FiolinRunRequest, 'inputs'>): Promise<string[]> {
    const inputs: File[] = [];
    for (const i of inputPaths) {
      const buf = await readFile(i);
      inputs.push(new File([buf], path.basename(i)));
    }
    const response = await this._runner.run(this.script, { inputs, ...requestOther });
    if (response.error) {
      throw response.error;
    }
    const outputBasenames: string[] = [];
    for (const f of response.outputs) {
      outputBasenames.push(f.name);
      await writeFile(path.join(this.outputDir, f.name), Buffer.from(await f.arrayBuffer()));
    }
    return outputBasenames;
  }
}
