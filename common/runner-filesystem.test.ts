import { describe, expect, it } from 'vitest';
import { getStdout, mkFile, mkRunner, mkScript } from './runner-test-util';

describe('PyodideRunner file system', () => {
  it('resets between runs', async () => {
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
});
