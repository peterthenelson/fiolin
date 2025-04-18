import { beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import { FiolinTmpDir } from '../common/test-util';
import { NodeFiolinRunner } from '../utils/runner';
import { pkgPath } from '../utils/pkg-path';

describe('convert-image', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();
  beforeEach(() => { output = new FiolinTmpDir(onTestFinished); });

  // The phone.jpg test file is an edited version of this CC0 file:
  // https://www.europeana.eu/en/item/192/item_CD5CCRR4BJDYSRHGSPLM5NIHRN3E4JXV
  const phone = pkgPath('fiols/testdata/phone.jpg');

  it('.bmp output', async () => {
    const runner = new NodeFiolinRunner('convert-image', output.path);
    const outputs = await runner.runWithLocalFs([phone], { args: { format: '.bmp' } });
    expect(outputs).toEqual(['phone.bmp']);
  });

  it('.gif output', async () => {
    const runner = new NodeFiolinRunner('convert-image', output.path);
    const outputs = await runner.runWithLocalFs([phone], { args: { format: '.gif' } });
    expect(outputs).toEqual(['phone.gif']);
  });

  it('.jpg output', async () => {
    const runner = new NodeFiolinRunner('convert-image', output.path);
    const outputs = await runner.runWithLocalFs([phone], { args: { format: '.jpg' } });
    expect(outputs).toEqual(['phone.jpg']);
  });

  it('.png output', async () => {
    const runner = new NodeFiolinRunner('convert-image', output.path);
    const outputs = await runner.runWithLocalFs([phone], { args: { format: '.png' } });
    expect(outputs).toEqual(['phone.png']);
  });

  it('.tiff output', async () => {
    const runner = new NodeFiolinRunner('convert-image', output.path);
    const outputs = await runner.runWithLocalFs([phone], { args: { format: '.tiff' } });
    expect(outputs).toEqual(['phone.tiff']);
  });

  it('.webp output', async () => {
    const runner = new NodeFiolinRunner('convert-image', output.path);
    const outputs = await runner.runWithLocalFs([phone], { args: { format: '.webp' } });
    expect(outputs).toEqual(['phone.webp']);
  });
});
