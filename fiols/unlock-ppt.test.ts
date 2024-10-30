import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FiolinTmpDir } from './test-util';
import { loadScript } from '../utils/config';
import { PyodideRunner } from '../utils/runner';
import { pkgPath } from '../utils/pkg-path';

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
    // TODO: Extract xml from the expected and actual pptx files and diff them.
  });
});
