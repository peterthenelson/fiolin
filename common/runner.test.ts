import { describe, expect, it } from 'vitest';
import { getStdout, mkRunner, mkScript } from './runner-test-util';

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

    it('reports SyntaxErrors with line numbers', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        1 + (2 * # line 2
      `);
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/SyntaxError\("'\(' was never closed"/);
      expect(response.lineno).toEqual(2);
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
});
