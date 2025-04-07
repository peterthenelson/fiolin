import { zipFiles } from './zip';
import { beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import { mkFile } from './runner-test-util';
import { FiolinTmpDir, listZip } from './test-util';
import { writeFileSync } from 'node:fs';

describe('zip', () => {
  let output = new FiolinTmpDir();
  beforeEach(() => { output = new FiolinTmpDir(onTestFinished); });

  it('zips multiple files into a single file', async () => {
    const foo = mkFile('foo.txt', 'foo');
    const bar = mkFile('bar.txt', 'bar');
    const baz = mkFile('baz.txt', 'baz');
    const zip = await zipFiles([foo, bar, baz]);
    writeFileSync(`${output.path}/${zip.name}`, Buffer.from(await zip.arrayBuffer()));
    const files = await listZip(`${output.path}/${zip.name}`);
    files.sort();
    expect(files).toEqual(['bar.txt', 'baz.txt', 'foo.txt']);
  });

  it('zips and preserves directory structure', async () => {
    const foo = mkFile('alpha/foo.txt', 'foo');
    const bar = mkFile('beta/gamma/bar.txt', 'bar');
    const baz = mkFile('beta/delta/baz.txt', 'baz');
    const zip = await zipFiles([foo, bar, baz]);
    writeFileSync(`${output.path}/${zip.name}`, Buffer.from(await zip.arrayBuffer()));
    const files = await listZip(`${output.path}/${zip.name}`);
    files.sort();
    expect(files).toEqual([
      'alpha/',
      'alpha/foo.txt',
      'beta/',
      'beta/delta/',
      'beta/delta/baz.txt',
      'beta/gamma/',
      'beta/gamma/bar.txt'
    ]);
  });
});
