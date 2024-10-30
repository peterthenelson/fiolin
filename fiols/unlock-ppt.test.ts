import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readFromZip, FiolinTmpDir } from './test-util';
import { loadScript } from '../utils/config';
import { PyodideRunner } from '../utils/runner';
import { pkgPath } from '../utils/pkg-path';
import path from 'node:path';
import xmlFormat from 'xml-formatter';

describe('unlock-pptx', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();

  beforeEach(() => { output = new FiolinTmpDir(); });
  afterEach(() => { output.cleanUp(); });

  it('unlocks ppts', async () => {
    const runner = new PyodideRunner(loadScript('unlock-ppt'));
    const response = await runner.run({
      inputs: [pkgPath('fiols/testdata/locked.pptx')],
      outputDir: output.path,
      argv: '',
    });
    expect(response.error).toBe(undefined);
    expect(response.outputs).toEqual(['locked-unlocked.pptx']);
    const expectedBuf = await readFromZip(
      pkgPath('fiols/testdata/unlocked.pptx'), 'ppt/presentation.xml');
    const actualBuf = await readFromZip(
      path.join(output.path, 'locked-unlocked.pptx'), 'ppt/presentation.xml');
    const expectedXml = xmlFormat(expectedBuf.toString());
    const actualXml = xmlFormat(actualBuf.toString());
    expect(actualXml).toEqual(expectedXml);
  });
});
