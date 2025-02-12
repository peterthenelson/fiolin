import { RollupOptions, Plugin } from 'rollup';
import css from 'rollup-plugin-import-css';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const pyodideImportStub = `(() => {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js');
  return self;
})()`;

function monacoWorker(path: string): RollupOptions {
  return {
    input: `node_modules/monaco-editor/esm/vs/${path}`,
    output: { dir: 'server/public/bundle', format: 'es', plugins: [terser()] }
  };
}

function directCopies() {
  return copy({
    targets: [
      {
        src: 'node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf',
        dest: 'server/public/bundle',
      },
      {
        src: 'node_modules/@imagemagick/magick-wasm/dist/magick.wasm',
        dest: 'server/public/bundle',
      },
      {
        src: 'web-utils/versions.json',
        dest: 'server/public/bundle',
      },
    ],
  });
}

function updateVersions(file: string): Plugin {
  return {
    name: 'rollup-plugin-update-versions',
    async writeBundle(outputOptions) {
      const dir = outputOptions.dir || path.dirname(outputOptions.file);
      const source = await readFile(path.join(dir, file), 'utf-8');
      const hash = createHash('shake256', { outputLength: 6 }).update(source).digest('base64url');
      let versions = await readFile(path.join(dir, 'versions.json'), 'utf-8');
      versions = versions.replace(new RegExp(file + '(\\?v=[a-zA-Z0-9_-]+)?'), `${file}?v=${hash}`);
      await writeFile(path.join(dir, 'versions.json'), versions, 'utf-8')
    }
  }
}

const config: RollupOptions[] = [
  monacoWorker('editor/editor.worker.js'),
  // NOTE: I'm leaving out language/{css,html,json,typescript}/{css,html,json,ts}.worker.js
  {
    input: 'web-host/host.ts',
    output: {
      dir: 'server/public/bundle',
      sourcemap: true,
      format: 'esm'
    },
    plugins: [
      css({ output: 'host.css' }),
      directCopies(),
      typescript(),
      nodeResolve(),
      terser(),
      updateVersions('host.js'),
    ]
  },
  {
    // NOTE: Not sure this is really the best way to swap the local import for
    // importScripts(cdnUrl), but... it works.
    input: 'web-worker/worker.ts',
    external: ['pyodide'],
    output: {
      file: 'server/public/bundle/worker.js',
      format: 'iife',
      sourcemap: true,
      globals: {
        pyodide: pyodideImportStub
      },
    },
    plugins: [typescript(), nodeResolve(), terser(), updateVersions('worker.js')],
  },
];

export default config;
