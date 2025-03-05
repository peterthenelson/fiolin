import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fileSha256, FiolinTmpDir } from './test-util';
import { NodeFiolinRunner } from '../utils/runner';
import { pkgPath } from '../utils/pkg-path';
import path from 'node:path';

describe('rotate-flip', () => {
  // The phone.jpg test file is an edited version of this CC0 file:
  // https://www.europeana.eu/en/item/192/item_CD5CCRR4BJDYSRHGSPLM5NIHRN3E4JXV
  let inputPath = pkgPath('fiols/testdata/phone.jpg');
  let inputHash = fileSha256(inputPath);
  let output: FiolinTmpDir = new FiolinTmpDir();

  beforeEach(() => { output = new FiolinTmpDir(); });
  afterEach(() => { output.cleanUp(); });

  it('writes rotated', async () => {
    const runner = new NodeFiolinRunner('rotate-flip', output.path);
    const outputs = await runner.runWithLocalFs(
      [inputPath], { args: { 'rotate': '180', 'download': 'true' } });
    expect(outputs).toEqual(['phone-rotated.jpg']);
    expect(fileSha256(path.join(output.path, 'phone-rotated.jpg'))).not.toEqual(
      inputHash);
  });

  it('writes flipped', async () => {
    const runner = new NodeFiolinRunner('rotate-flip', output.path);
    const outputs = await runner.runWithLocalFs(
      [inputPath], { args: { 'flip': 'vertical', 'download': 'true' } });
    expect(outputs).toEqual(['phone-rotated.jpg']);
    expect(fileSha256(path.join(output.path, 'phone-rotated.jpg'))).not.toEqual(
      inputHash);
  });
});


