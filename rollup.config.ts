import { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';

const pyodideImportStub = `(() => {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js');
  return self;
})()`;

// TODO: Add minification
const config: RollupOptions[] = [
  {
    input: 'web-host/index.ts',
    output: {
      file: 'server/public/index.js',
      format: 'esm'
    },
    plugins: [typescript()]
  },
  {
    // NOTE: Not sure this is really the best way to swap the local import for
    // importScripts(cdnUrl), but... it works.
    input: 'web-worker/worker.ts',
    external: ['pyodide'],
    output: {
      file: 'server/public/worker.js',
      format: 'iife',
      globals: {
        pyodide: pyodideImportStub
      },
    },
    plugins: [typescript()]
  },
];

export default config;
