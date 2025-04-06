import { beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import { FiolinTmpDir } from '../common/test-util';
import { NodeFiolinRunner } from '../utils/runner';
import { pkgPath } from '../utils/pkg-path';

describe('grayscale', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();
  beforeEach(() => { output = new FiolinTmpDir(onTestFinished); });

  it('converts images to grayscale', async () => {
    const runner = new NodeFiolinRunner('grayscale', output.path);
    // The phone.jpg test file is an edited version of this CC0 file:
    // https://www.europeana.eu/en/item/192/item_CD5CCRR4BJDYSRHGSPLM5NIHRN3E4JXV
    const outputs = await runner.runWithLocalFs(
      [pkgPath('fiols/testdata/phone.jpg')], {});
    expect(outputs).toEqual(['phone-gray.jpg']);
  });
});


