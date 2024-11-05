import { describe, expect, it } from 'vitest';
import { PyodideRunner } from './runner';
import { FiolinScript } from './types';

function dedent(s: string): string {
  const lines = s.split('\n');
  if (lines.length === 1) {
    return s;
  }
  if (lines[0] !== '') {
    throw new Error('Expected first line of multiline string to be empty');
  }
  const indent = lines[1].match(/^ */)![0].length;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].match(/^\s*$/)) continue;
    if (lines[i].match(/^ */)![0].length < indent) {
      throw new Error(`Line expected to have ${indent} leading spaces; got ${lines[i]}`);
    }
    lines[i] = lines[i].substring(indent);
  }
  return lines.join('\n');
}

function mkScript(python: string): FiolinScript {
  return {
    meta: { title: 'title', description: 'desc' },
    interface: { inputFiles: 'MULTI', outputFiles: 'MULTI' },
    runtime: {},
    code: { python: dedent(python) },
  };
}

function mkFile(fileName: string, contents: string): File {
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

describe('PyodideRunner', () => {
  it('runs', async () => {
    const runner = new PyodideRunner({ indexUrl });
    const script = mkScript('print("hello")');
    const response = await runner.run(script, { inputs: [], argv: '' });
    expect(response.error).toBeUndefined();
    expect(response.stdout).toMatch(/hello/);
  });

  it('resets the file system between runs', async () => {
    const runner = new PyodideRunner({ indexUrl });
    const script = mkScript(`
      import js
      import os
      import sys
      # First dump all the existing file paths to stderr
      def dump(dir):
        for dirpath, _, filenames in os.walk(dir):
          for f in filenames:
            print(os.path.join(dirpath, f), file=sys.stderr)
      dump('/input')
      dump('/output')
      # Copy inputs to outputs
      js.outputs = js.inputs
      for i in js.inputs:
        with open(f'/input/{i}') as infile:
          with open(f'/output/{i}', 'w') as outfile:
            outfile.write(infile.read())
    `);
    {
      const response = await runner.run(script, {
        inputs: [mkFile('foo', 'first foo')],
        argv: ''
      });
      expect(response.error).toBeUndefined();
      expect(response.stderr.trim().split('\n')).toEqual(['/input/foo']);
      expect(response.outputs.length).toEqual(1);
      expect(response.outputs[0].name).toEqual('foo');
      expect(await response.outputs[0].text()).toEqual('first foo');
    }
    {
      const response = await runner.run(script, {
        inputs: [
          mkFile('foo', 'foo two'),
          mkFile('bar', 'barian')
        ],
        argv: ''
      });
      expect(response.error).toBeUndefined();
      expect(response.stderr.trim().split('\n').sort()).toEqual(
        ['/input/bar', '/input/foo']);
      expect(response.outputs.length).toEqual(2);
      expect(response.outputs.map((f) => f.name).sort()).toEqual(
        ['bar', 'foo']);
      const outputs: string[] = [];
      for (const f of response.outputs) {
        outputs.push(await f.text());
      }
      expect(outputs.sort()).toEqual(['barian', 'foo two']);
    }
  });

  it('automatically installs pkgs', async () => {
    // TODO
  });

  it('can manually preinstall pkgs', async () => {
    // TODO
  });

  it('avoids redundant pkg installation', async () => {
    // TODO
  });

  it('reloads the interpreter when pkgs change', async () => {
    // TODO
  });
});
