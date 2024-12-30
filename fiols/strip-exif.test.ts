import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fileSha256, FiolinTmpDir } from './test-util';
import { NodeFiolinRunner } from '../utils/runner';
import path from 'node:path';
import { pkgPath } from '../utils/pkg-path';

describe('strip-exif', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();

  beforeEach(() => { output = new FiolinTmpDir(); });
  afterEach(() => { output.cleanUp(); });

  it('strips exif info', async () => {
    let stdout = '';
    const runner = new NodeFiolinRunner('strip-exif', output.path, {
      debug(s: string) { console.debug(s) },
      info(s: string) { console.info(s); stdout += s + '\n' },
      warn(s: string) { console.warn(s) },
      error(s: string) { console.error(s) },
    });
    // The test file is from Wikipedia (and its exif data is pictured in the
    // entry on Exif). It was taken by user Praveenp and is available under the
    // CC BY-SA 4.0 license:
    // https://commons.wikimedia.org/wiki/File:Epepeotes_uncinatus_@_Kanjirappally.jpg
    const inputs = [
      pkgPath('fiols/testdata/exif.jpg'),
    ];
    const outputs = await runner.runWithLocalFs(inputs, { argv: '' });
    expect(outputs).toEqual(['exif-no-exif.jpg']);
    expect(stdout).toMatch(/Removing the following Exif data:.*Praveen\. P/s);
    stdout = '';
    const _ = await runner.runWithLocalFs([path.join(output.path, outputs[0])], { argv: '' })
    expect(stdout).toMatch(/No Exif data found!/);
  });
});
