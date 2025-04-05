import { zipFiles } from './zip';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { mkFile } from './runner-test-util';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// TODO: Reorganize test utilities and move all this failure-awareness for tmp
// directory cleanup into the tmp dir class.
describe('zip', () => {
  let tmpDir: string = '';

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(tmpdir(), 'zip-test-'));
  });

  afterEach((ctx) => {
    if (ctx.task.result?.state == 'fail') {
      console.log('Temp files for failed test run can be found here: ', tmpDir);
    } else {
      rmSync(tmpDir, { force: true, recursive: true });
    }
  });

  it('zips multiple files into a single file', async () => {
    const foo = mkFile('foo.txt', 'foo');
    const bar = mkFile('bar.txt', 'bar');
    const baz = mkFile('baz.txt', 'baz');
    const zip = await zipFiles([foo, bar, baz]);
    writeFileSync(`${tmpDir}/${zip.name}`, Buffer.from(await zip.arrayBuffer()));
    // TODO: Add expectations that the zip file has what it should
  });
});
