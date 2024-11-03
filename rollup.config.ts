import { RollupOptions } from 'rollup';
import css from 'rollup-plugin-import-css';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';

const pyodideImportStub = `(() => {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js');
  return self;
})()`;

function monacoWorker(path: string): RollupOptions {
  return {
    input: `node_modules/monaco-editor/esm/vs/${path}`,
    output: { dir: 'server/public/bundle', format: 'es' }
  };
}

// TODO: Add minification
const config: RollupOptions[] = [
  monacoWorker('editor/editor.worker.js'),
  // NOTE: I'm leaving out language/{css,html,json,typescript}/{css,html,json,ts}.worker.js
  {
    input: 'web-host/index.ts',
    output: {
      dir: 'server/public/bundle',
      format: 'esm'
    },
    plugins: [
      css({ output: 'included.css' }),
      typescript(),
      nodeResolve(),
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
      globals: {
        pyodide: pyodideImportStub
      },
    },
    plugins: [typescript()]
  },
];

export default config;
