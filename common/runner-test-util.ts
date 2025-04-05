import { expect } from 'vitest';
import { ImageMagickLoader } from './image-magick';
import { dedent } from './indent';
import { IConsole, PyodideRunner } from './runner';
import { FiolinForm, FiolinRunResponse, FiolinScript, FiolinScriptRuntime, FiolinWasmLoader, PostProcessor } from './types';
import { readFileSync } from 'node:fs';

export interface mkScriptOptions {
  pkgs?: string[];
  mods?: string[];
  form?: FiolinForm;
}

export function mkScript(python: string, options?: mkScriptOptions): FiolinScript {
  const runtime: FiolinScriptRuntime = {};
  const pkgs = options?.pkgs || [];
  if (pkgs.length > 0) {
    runtime.pythonPkgs = pkgs.map((n) => ({ type: 'PYPI', name: n }))
  }
  const mods = options?.mods || [];
  if (mods.length > 0) {
    runtime.wasmModules = mods.map((n) => ({ name: n }))
  }
  return {
    meta: { title: 'title', description: 'desc' },
    interface: { inputFiles: 'ANY', outputFiles: 'ANY', form: options?.form },
    runtime,
    code: { python: dedent(python) },
  };
}

export function mkFile(fileName: string, contents: string): File {
  return new File([contents], fileName);
}

const indexUrl = (() => {
  const testPath = expect.getState().testPath;
  if (!testPath) {
    throw new Error('Unable to resolve testPath');
  }
  const parts = testPath.split('/');
  // Drop the /common/runner.test.ts and add the path to pyodide
  parts.pop();
  parts.pop();
  parts.push('node_modules/pyodide');
  return parts.join('/');
})();

const defaultLoaders: Record<string, FiolinWasmLoader> = (() => {
  const testPath = expect.getState().testPath;
  if (!testPath) {
    throw new Error('Unable to resolve testPath');
  }
  const parts = testPath.split('/');
  // Drop the /common/runner.test.ts and add the path to pyodide
  parts.pop();
  parts.pop();
  parts.push('node_modules/@imagemagick/magick-wasm/dist/magick.wasm');
  return {
    'imagemagick': new ImageMagickLoader(readFileSync(parts.join('/'))),
  };
})();

export interface mkRunnerOptions {
  loaderOverrides?: Record<string, FiolinWasmLoader>;
  console?: IConsole;
  postProcessors?: PostProcessor[];
}

export function mkRunner(opts?: mkRunnerOptions): PyodideRunner {
  const loaders = { ...defaultLoaders, ...opts?.loaderOverrides };
  return new PyodideRunner({
    indexUrl,
    loaders,
    console: opts?.console,
    postProcessors: opts?.postProcessors,
  });
}

export function multiRe(...res: RegExp[]): RegExp {
  return new RegExp(res.map((r) => r.source).join(''), 's');
}

export function getDebug(resp: FiolinRunResponse): string {
  return resp.log.filter(([ll, _]) => ll === 'DEBUG').map(([_, v]) => v + '\n').join('');
}

export function getStdout(resp: FiolinRunResponse): string {
  return resp.log.filter(([ll, _]) => ll === 'INFO').map(([_, v]) => v + '\n').join('');
}

export function getWarn(resp: FiolinRunResponse): string {
  return resp.log.filter(([ll, _]) => ll === 'WARN').map(([_, v]) => v + '\n').join('');
}

export function getStderr(resp: FiolinRunResponse): string {
  return resp.log.filter(([ll, _]) => ll === 'ERROR').map(([_, v]) => v + '\n').join('');
}
