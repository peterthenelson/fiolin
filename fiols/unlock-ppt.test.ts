import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readFromZip, FiolinTmpDir } from './test-util';
import { NodeFiolinRunner } from '../utils/runner';
import { pkgPath } from '../utils/pkg-path';
import path from 'node:path';
import xmlFormat from 'xml-formatter';

describe('unlock-pptx', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();

  beforeEach(() => { output = new FiolinTmpDir(); });
  afterEach(() => { output.cleanUp(); });

  it('unlocks ppts', async () => {
    const runner = new NodeFiolinRunner('unlock-ppt', output.path);
    const outputs = await runner.runWithLocalFs(
      [pkgPath('fiols/testdata/locked.pptx')], { argv: '' });
    expect(outputs).toEqual(['locked-unlocked.pptx']);
    const expectedBuf = await readFromZip(
      pkgPath('fiols/testdata/unlocked.pptx'), 'ppt/presentation.xml');
    const actualBuf = await readFromZip(
      path.join(output.path, 'locked-unlocked.pptx'), 'ppt/presentation.xml');
    const expectedXml = xmlFormat(expectedBuf.toString());
    const actualXml = xmlFormat(actualBuf.toString());
    expect(actualXml).toEqual(expectedXml);
  });
});
