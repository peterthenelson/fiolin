import { describe, expect, it } from 'vitest';
import { PyodideRunner } from './runner';
import { FiolinScript, FiolinScriptRuntime } from './types';

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

function mkScript(python: string, pkgNames?: string[]): FiolinScript {
  const runtime: FiolinScriptRuntime = {};
  if (pkgNames && pkgNames.length > 0) {
    runtime.pythonPkgs = pkgNames.map((n) => ({ type: 'PYPI', name: n }))
  }
  return {
    meta: { title: 'title', description: 'desc' },
    interface: { inputFiles: 'MULTI', outputFiles: 'MULTI' },
    runtime,
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

function multiRe(...res: RegExp[]): RegExp {
  return new RegExp(res.map((r) => r.source).join(''), 's');
}

describe('PyodideRunner', () => {
  it('runs', async () => {
    const runner = new PyodideRunner({ indexUrl });
    const script = mkScript('print("hello")');
    const response = await runner.run(script, { inputs: [], argv: '' });
    expect(response.error).toBeUndefined();
    expect(response.stdout).toMatch(/hello/);
  });

  describe('error handling', () => {
    it('reports exceptions and line numbers', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const script = mkScript(`
        print('ok') # line 2
        raise Exception('not ok') # line 3
        print('ok again') # line 4
      `);
      const response = await runner.run(script, { inputs: [], argv: '' });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/raise Exception\('not ok'\)/);
      expect(response.lineno).toEqual(3);
    });

    it('reports non-zero sys.exit as error with message', async () => {
      const runner = new PyodideRunner({ indexUrl });
      {
        const script = mkScript(`
          import sys
          print('prints', file=sys.stderr)
          sys.exit(0) # exits but not treated as an error
          print('does not print', file=sys.stderr)
        `);
        const response = await runner.run(script, { inputs: [], argv: '' });
        expect(response.error).toBeUndefined();
        expect(response.stderr).toEqual('prints\n');
      }
      {
        const script = mkScript(`
          import sys
          sys.exit('error message') # treated like exception, but no stack trace
        `);
        const response = await runner.run(script, { inputs: [], argv: '' });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toEqual('error message')
      }
    });
  });

  it('resets the file system between runs', async () => {
    const runner = new PyodideRunner({ indexUrl });
    const script = mkScript(`
      import fiolin
      import os
      import sys
      # First dump all the existing input/output file paths to stderr
      def dump(dir):
        for dirpath, _, filenames in os.walk(dir):
          for f in filenames:
            print(os.path.join(dirpath, f), file=sys.stderr)
      dump('/input')
      dump('/output')
      # Copy inputs to outputs
      for i in fiolin.get_input_basenames():
        fiolin.cp(f'/input/{i}', f'/output/{i}')
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

  describe('checks number of input/output files', () => {
    it('checks inputs when inputFiles NONE', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const script = mkScript('print("hello")');
      script.interface = { inputFiles: 'NONE', outputFiles: 'NONE' };
      {
        const response = await runner.run(script, { inputs: [], argv: '' });
        expect(response.error).toBeUndefined();
      }
      {
        const response = await runner.run(script, { inputs: [mkFile('x', 'x')], argv: '' });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/no input files; got 1/);
      }
    });

    it('checks inputs when inputFiles SINGLE', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const script = mkScript('import fiolin; print(fiolin.get_input_basename())');
      script.interface = { inputFiles: 'SINGLE', outputFiles: 'NONE' };
      const [foo, bar] = [mkFile('foo', 'foo'), mkFile('bar', 'bar')];
      {
        const response = await runner.run(script, { inputs: [foo], argv: '' });
        expect(response.error).toBeUndefined();
      }
      {
        const response = await runner.run(script, { inputs: [], argv: '' });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/one input file; got 0/);
      }
      {
        const response = await runner.run(script, { inputs: [foo, bar], argv: '' });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/one input file; got 2/);
      }
    });

    it('checks outputs when outputFiles NONE', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const saveNFiles = mkScript(`
        import fiolin
        for i in range(int(fiolin.argv()[0])):
          with open(f'/output/out{i}', 'w') as f:
            f.write('foo')
      `);
      saveNFiles.interface = { inputFiles: 'NONE', outputFiles: 'NONE' };
      {
        const response = await runner.run(saveNFiles, { inputs: [], argv: '0' });
        expect(response.error).toBeUndefined();
      }
      {
        const response = await runner.run(saveNFiles, { inputs: [], argv: '1' });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/no output files; got 1/);
      }
    });

    it('checks outputs when outputFiles SINGLE', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const saveNFiles = mkScript(`
        import fiolin
        for i in range(int(fiolin.argv()[0])):
          with open(f'/output/out{i}', 'w') as f:
            f.write('foo')
      `);
      saveNFiles.interface = { inputFiles: 'NONE', outputFiles: 'SINGLE' };
      {
        const response = await runner.run(saveNFiles, { inputs: [], argv: '1' });
        expect(response.error).toBeUndefined();
      }
      {
        const response = await runner.run(saveNFiles, { inputs: [], argv: '0' });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/one output file; got 0/);
      }
      {
        const response = await runner.run(saveNFiles, { inputs: [], argv: '2' });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/one output file; got 2/);
      }
    });
  });

  describe('package installation', () => {
    it('automatically installs pkgs', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'), file=sys.stderr)
      `, ['idna']);
      const response = await runner.run(script, { inputs: [], argv: '' });
      expect(response.error).toBeUndefined();
      expect(response.stderr.trim()).toEqual("b'xn--eckwd4c7c.xn--zckzah'");
      expect(response.stdout).toMatch(multiRe(
        /Resetting FS.*/,
        /1 python packages to be installed.*/,
        /Installing package idna.*/
      ));
    });

    it('can manually preinstall pkgs', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'), file=sys.stderr)
      `, ['idna']);
      await runner.installPkgs(script);
      const response = await runner.run(script, { inputs: [], argv: '' });
      expect(response.error).toBeUndefined();
      expect(response.stderr.trim()).toEqual("b'xn--eckwd4c7c.xn--zckzah'");
      expect(response.stdout).toMatch(multiRe(
        /Resetting FS.*/,
        /Required packages already installed.*/,
      ));
    });

    it('avoids redundant pkg installation', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'), file=sys.stderr)
      `, ['idna']);
      {
        const response = await runner.run(script, { inputs: [], argv: '' });
        expect(response.error).toBeUndefined();
        expect(response.stdout).toMatch(multiRe(
          /Resetting FS.*/,
          /1 python packages to be installed.*/,
          /Installing package idna.*/
        ));
      }
      {
        const response = await runner.run(script, { inputs: [], argv: '' });
        expect(response.error).toBeUndefined();
        expect(response.stdout).toMatch(multiRe(
          /Resetting FS.*/,
          /Required packages already installed.*/,
        ));
      }
    });

    it('reloads the interpreter when pkgs change', async () => {
      const runner = new PyodideRunner({ indexUrl });
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'), file=sys.stderr)
      `, ['idna']);
      {
        const response = await runner.run(script, { inputs: [], argv: '' });
        expect(response.error).toBeUndefined();
        expect(response.stdout).toMatch(multiRe(
          /Resetting FS.*/,
          /1 python packages to be installed.*/,
          /Installing package idna.*/
        ));
      }
      {
        script.runtime.pythonPkgs?.push({ type: 'PYPI', name: 'six' });
        const response = await runner.run(script, { inputs: [], argv: '' });
        expect(response.error).toBeUndefined();
        expect(response.stdout).toMatch(multiRe(
          /Resetting FS.*/,
          /Required packages differ from those installed.*/,
          /2 python packages to be installed.*/,
          /Installing package idna.*/,
          /Installing package six.*/
        ));
      }
    });
  });
});
