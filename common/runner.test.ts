import { describe, expect, it } from 'vitest';
import { PyodideRunner } from './runner';
import { FiolinRunResponse, FiolinScript, FiolinScriptRuntime } from './types';
import { dedent } from './indent';
import { ImageMagickLoader } from './image-magick';
import { readFileSync } from 'node:fs';
import { FiolinForm } from './types/form';

interface mkScriptOptions {
  pkgs?: string[];
  mods?: string[];
  form?: FiolinForm;
}

function mkScript(python: string, options?: mkScriptOptions): FiolinScript {
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

const loaders = (() => {
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

function mkRunner(): PyodideRunner {
  return new PyodideRunner({ indexUrl, loaders });
}

function multiRe(...res: RegExp[]): RegExp {
  return new RegExp(res.map((r) => r.source).join(''), 's');
}

function getDebug(resp: FiolinRunResponse): string {
  return resp.log.filter(([ll, _]) => ll === 'DEBUG').map(([_, v]) => v + '\n').join('');
}

function getStdout(resp: FiolinRunResponse): string {
  return resp.log.filter(([ll, _]) => ll === 'INFO').map(([_, v]) => v + '\n').join('');
}

describe('PyodideRunner', () => {
  it('runs', async () => {
    const runner = mkRunner();
    const script = mkScript('print("hello")');
    const response = await runner.run(script, { inputs: [] });
    expect(response.error).toBeUndefined();
    expect(getStdout(response)).toMatch(/hello/);
  });

  describe('error handling', () => {
    it('reports exceptions and line numbers', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        print('ok') # line 2
        raise Exception('not ok') # line 3
        print('ok again') # line 4
      `);
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/raise Exception\('not ok'\)/);
      expect(response.lineno).toEqual(3);
    });

    it('reports non-zero sys.exit as error with message', async () => {
      const runner = mkRunner();
      {
        const script = mkScript(`
          import sys
          print('prints')
          sys.exit(0) # exits but not treated as an error
          print('does not print')
        `);
        const response = await runner.run(script, { inputs: [] });
        expect(response.error).toBeUndefined();
        expect(getStdout(response)).toEqual('prints\n');
      }
      {
        const script = mkScript(`
          import sys
          sys.exit('error message') # treated like exception, but no stack trace
        `);
        const response = await runner.run(script, { inputs: [] });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toEqual('error message')
      }
    });
  });

  it('resets the file system between runs', async () => {
    const runner = mkRunner();
    const script = mkScript(`
      import fiolin
      import os
      import sys
      # First dump all the existing input/output file paths to stderr
      def dump(dir):
        for dirpath, _, filenames in os.walk(dir):
          for f in filenames:
            print(os.path.join(dirpath, f))
      dump('/input')
      dump('/output')
      # Copy inputs to outputs
      for i in fiolin.get_input_basenames():
        fiolin.cp(f'/input/{i}', f'/output/{i}')
    `);
    {
      const response = await runner.run(script, {
        inputs: [mkFile('foo', 'first foo')],
      });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim().split('\n')).toEqual(['/input/foo']);
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
      });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim().split('\n').sort()).toEqual(
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
      const runner = mkRunner();
      const script = mkScript('print("hello")');
      script.interface = { inputFiles: 'NONE', outputFiles: 'NONE' };
      {
        const response = await runner.run(script, { inputs: [] });
        expect(response.error).toBeUndefined();
      }
      {
        const response = await runner.run(script, { inputs: [mkFile('x', 'x')] });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/no input files; got 1/);
      }
    });

    it('checks inputs when inputFiles SINGLE', async () => {
      const runner = mkRunner();
      const script = mkScript('import fiolin; print(fiolin.get_input_basename())');
      script.interface = { inputFiles: 'SINGLE', outputFiles: 'NONE' };
      const [foo, bar] = [mkFile('foo', 'foo'), mkFile('bar', 'bar')];
      {
        const response = await runner.run(script, { inputs: [foo] });
        expect(response.error).toBeUndefined();
      }
      {
        const response = await runner.run(script, { inputs: [] });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/one input file; got 0/);
      }
      {
        const response = await runner.run(script, { inputs: [foo, bar] });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/one input file; got 2/);
      }
    });

    it('checks outputs when outputFiles NONE', async () => {
      const runner = mkRunner();
      const saveNFiles = mkScript(`
        import fiolin
        for i in range(int(fiolin.args()['n'])):
          with open(f'/output/out{i}', 'w') as f:
            f.write('foo')
      `);
      saveNFiles.interface = { inputFiles: 'NONE', outputFiles: 'NONE' };
      {
        const response = await runner.run(saveNFiles, { inputs: [], args: { 'n': '0' } });
        expect(response.error).toBeUndefined();
      }
      {
        const response = await runner.run(saveNFiles, { inputs: [], args: { 'n': '1' } });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/no output files; got 1/);
      }
    });

    it('checks outputs when outputFiles SINGLE', async () => {
      const runner = mkRunner();
      const saveNFiles = mkScript(`
        import fiolin
        for i in range(int(fiolin.args()['n'])):
          with open(f'/output/out{i}', 'w') as f:
            f.write('foo')
      `);
      saveNFiles.interface = { inputFiles: 'NONE', outputFiles: 'SINGLE' };
      {
        const response = await runner.run(saveNFiles, { inputs: [], args: { 'n': '1' } });
        expect(response.error).toBeUndefined();
      }
      {
        const response = await runner.run(saveNFiles, { inputs: [], args: { 'n': '0' } });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/one output file; got 0/);
      }
      {
        const response = await runner.run(saveNFiles, { inputs: [], args: { 'n': '2 '} });
        expect(response.error).not.toBeUndefined();
        expect(response.error?.message).toMatch(/one output file; got 2/);
      }
    });
  });

  describe('python package installation', () => {
    it('automatically installs pkgs', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'))
      `, { pkgs: ['idna'] });
      const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim()).toEqual("b'xn--eckwd4c7c.xn--zckzah'");
      expect(getDebug(response)).toMatch(multiRe(
        /1 python packages to be installed.*/,
        /Installing package idna.*/,
        /Resetting FS.*/
      ));
    });

    it('can manually preinstall pkgs', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'))
      `, { pkgs: ['idna'] });
      await runner.installPkgs(script);
      const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim()).toEqual("b'xn--eckwd4c7c.xn--zckzah'");
      expect(getDebug(response)).toMatch(multiRe(
        /Required packages\/modules already installed.*/,
        /Resetting FS.*/
      ));
    });

    it('avoids redundant pkg installation', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'), file=sys.stderr)
      `, { pkgs: ['idna'] });
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /1 python packages to be installed.*/,
          /Installing package idna.*/,
          /Resetting FS.*/
        ));
      }
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /Required packages\/modules already installed.*/,
          /Resetting FS.*/
        ));
      }
    });

    it('reloads the interpreter when pkgs change', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'), file=sys.stderr)
      `, { pkgs: ['idna'] });
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /1 python packages to be installed.*/,
          /Installing package idna.*/,
          /Resetting FS.*/
        ));
      }
      {
        script.runtime.pythonPkgs?.push({ type: 'PYPI', name: 'six' });
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /Required packages\/modules differ from those installed.*/,
          /2 python packages to be installed.*/,
          /Installing package idna.*/,
          /Installing package six.*/,
          /Resetting FS.*/
        ));
      }
    });
  });

  describe('wasm module installation', () => {
    it('automatically installs mods', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import imagemagick
        import sys
        print(imagemagick.Magick.imageMagickVersion)
      `, { mods: ['imagemagick'] });
      const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim()).toMatch(/ImageMagick.*imagemagick.org/);
      expect(getDebug(response)).toMatch(multiRe(
        /1 wasm modules to be installed.*/,
        /Installing module imagemagick.*/,
        /Resetting FS.*/
      ));
    });

    it('can manually preinstall mods', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import imagemagick
        import sys
        print(imagemagick.Magick.imageMagickVersion)
      `, { mods: ['imagemagick'] });
      await runner.installPkgs(script);
      const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim()).toMatch(/ImageMagick.*imagemagick.org/);
      expect(getDebug(response)).toMatch(multiRe(
        /Required packages\/modules already installed.*/,
        /Resetting FS.*/
      ));
    });

    it('avoids redundant mod installation', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import imagemagick
        import sys
        print(imagemagick.Magick.imageMagickVersion, file=sys.stderr)
      `, { mods: ['imagemagick'] });
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /1 wasm modules to be installed.*/,
          /Installing module imagemagick.*/,
          /Resetting FS.*/
        ));
      }
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /Required packages\/modules already installed.*/,
          /Resetting FS.*/
        ));
      }
    });
  });

  describe('form updates', () => {
    it('fails on bad form ids', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        print('ok')
      `, { form: { children: [ { type: 'TEXT', name: 'bad id' } ] } });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/Invalid form input name: bad id/);
    });

    it('fails on buttons w/incomplete ids', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        print('ok')
      `, { form: { children: [ { type: 'BUTTON', text: 'Name but no value', name: 'x' } ] } });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/BUTTON must specify a value if they specify a name/);
    });

    it('fails on colliding form ids', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        print('ok')
      `, {
        form: {
          children: [
            { type: 'TEXT', name: 'foo' },
            { type: 'URL', name: 'foo' },
          ]
        }
      });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/components indistinguishable \(name=foo\)/);
    });

    it('fail updates when no such id', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import fiolin
        fiolin.form_set_hidden(name='bar')
      `, { form: { children: [ { type: 'TEXT', name: 'foo' } ] } });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/Could not find component with name=bar/);
    });

    it('reports updates otherwise', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import fiolin
        fiolin.form_set_focus(name='checkbox')
        fiolin.form_set_hidden(name='text')
        fiolin.form_set_disabled(name='radio', value='opt-1', disabled=False)
        fiolin.form_set_hidden(name='button', value='', hidden=False)
        fiolin.form_set_disabled(name='divs-too')
      `, {
        form: {
          children: [
            { type: 'CHECKBOX', name: 'checkbox' },
            { type: 'TEXT', name: 'text', value: 'this init val not part of id' },
            { type: 'RADIO', name: 'radio', value: 'opt-1' },
            { type: 'RADIO', name: 'radio', value: 'opt-2' },
            { type: 'BUTTON', text: 'Un-identifiable but not illegal' },
            { type: 'BUTTON', text: 'Empty', name: 'button', value: '' },
            { type: 'BUTTON', text: 'Non-empty', name: 'button', value: 'blah' },
            { type: 'DIV', dir: 'ROW', name: 'divs-too', children: [] },
          ],
        }
      });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).toBeUndefined();
      expect(response.formUpdates).toEqual([
        { type: 'FOCUS', id: { name: 'checkbox' } },
        { type: 'HIDDEN', id: { name: 'text' }, value: true },
        { type: 'DISABLED', id: { name: 'radio', value: 'opt-1' }, value: false },
        { type: 'HIDDEN', id: { name: 'button', value: '' }, value: false },
        { type: 'DISABLED', id: { name: 'divs-too' }, value: true },
      ]);
    });
  });
});
