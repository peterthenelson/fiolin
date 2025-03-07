import { loadPyodide } from 'pyodide';
import { readFile } from './emscripten-fs';
import { describe, expect, it } from 'vitest';

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

describe('emscripten-fs utils', () => {
  it('translates errno errors', async () => {
    const pyodide = await loadPyodide({ indexURL: indexUrl });
    expect(() => {
      readFile(pyodide.FS, '/nonexistent', pyodide.ERRNO_CODES);
    }).toThrow(/\[ENOENT \(errno=44\)\]/);
  });
});
