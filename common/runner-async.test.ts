import { describe, expect, it } from 'vitest';
import { getStdout, mkRunner, mkScript } from './runner-test-util';
import { FiolinWasmLoader } from './types';
import { PyodideInterface } from 'pyodide';
import { IConsole } from './runner';

describe('PyodideRunner async', () => {
  it('calls and awaits main', async () => {
    const runner = mkRunner();
    const script = mkScript(`
      import asyncio
      async def main():
        await asyncio.sleep(0)
        print('done')
    `);
    const response = await runner.run(script, { inputs: [] });
    expect(response.error).toBeUndefined();
    expect(getStdout(response)).toMatch(/done/);
  });

  describe('callback_to_ctx', () => {
    it('works for pure python callbacks', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import fiolin

        class Destructo:
          def __init__(self):
            print('created')
            self.destroyed = False
          def destroy(self):
            print('destroyed')
            self.destroyed = True
          def run(self):
            if self.destroyed:
              raise ValueError('already destroyed')
            print('running')

        async def destructo_cb(cb):
          v = Destructo()
          await cb(v)
          v.destroy()

        async def main():
          async with fiolin.callback_to_ctx(destructo_cb) as v:
            v.run()
          print('done')
      `);
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).split('\n')).toEqual([
        'created', 'running', 'destroyed', 'done', ''
      ]);
    });

    it('works with js ffi', async () => {
      const stdout: string[] = [];
      const logger: IConsole = {
        debug(s: string) { console.debug(s) },
        info(s: string) { stdout.push(s); console.info(s) },
        warn(s: string) { console.warn(s) },
        error(s: string) { console.error(s) },
      }
      class Destructo {
        private destroyed: boolean;
        constructor() {
          this.destroyed = false;
          logger.info('created');
        }
        destroy() {
          logger.info('destroyed');
          this.destroyed = true;
        }
        run() {
          if (this.destroyed) {
            throw new Error('already destroyed');
          }
          logger.info('running');
        }
      }
      class DestructoLoader extends FiolinWasmLoader {
        async loadModule(pyodide: PyodideInterface): Promise<any> {
          return {
            async destructoCb(cb: (d: Destructo) => object | Promise<void>) {
              const d = new Destructo();
              const result = cb(d);
              if (result instanceof Promise) {
                await result;
              }
              d.destroy();
            }
          }
        }
      }
      const runner = mkRunner({
        console: logger,
        loaderOverrides: {'destructo': new DestructoLoader() },
      });
      const script = mkScript(`
        import fiolin
        import destructo
        async def main():
          async with fiolin.callback_to_ctx(destructo.destructoCb) as v:
            v.run()
          print('done')
      `, { mods: ['destructo'] });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).toBeUndefined();
      expect(stdout).toEqual([
        'created', 'running', 'destroyed', 'done'
      ]);
    });
  });
});
