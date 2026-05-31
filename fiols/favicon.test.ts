import { beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import { FiolinTmpDir } from '../common/test-util';
import { NodeFiolinRunner } from '../utils/runner';
import { pkgPath } from '../utils/pkg-path';

describe('favicon', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();
  beforeEach(() => { output = new FiolinTmpDir(onTestFinished); });

  it('creates a single .ico file by default', async () => {
    const runner = new NodeFiolinRunner('favicon', output.path);
    // The phone.jpg test file is an edited version of this CC0 file:
    // https://www.europeana.eu/en/item/192/item_CD5CCRR4BJDYSRHGSPLM5NIHRN3E4JXV
    const outputs = await runner.runWithLocalFs(
      [pkgPath('fiols/testdata/phone.jpg')], { args: { 'download': 'true', 'output_format': 'ico' } });
    expect(outputs).toEqual(['phone.ico']);
  });

  it('creates separate png files when output_format is png', async () => {
    const runner = new NodeFiolinRunner('favicon', output.path);
    const outputs = await runner.runWithLocalFs(
      [pkgPath('fiols/testdata/phone.jpg')], { args: { 'download': 'true', 'output_format': 'png' } });
    expect(outputs).toEqual(['phone-256.png', 'phone-128.png', 'phone-64.png', 'phone-32.png', 'phone-16.png']);
  });
});
