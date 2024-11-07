import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fileSha256, FiolinTmpDir } from './test-util';
import { NodeFiolinRunner } from '../utils/runner';
import path from 'node:path';
import { pkgPath } from '../utils/pkg-path';

describe('merge-pdf', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();

  beforeEach(() => { output = new FiolinTmpDir(); });
  afterEach(() => { output.cleanUp(); });

  it('merges pdfs', async () => {
    const runner = new NodeFiolinRunner('merge-pdf', output.path);
    // The test files were made by me manually writing postscript and
    // https://ehubsoft.herokuapp.com/psviewer/ to convert them to pdfs.
    const inputs = [
      pkgPath('fiols/testdata/loss.pdf'),
      pkgPath('fiols/testdata/loss (1).pdf'),
    ];
    const outputs = await runner.runWithLocalFs(inputs, { argv: '' });
    outputs.sort();
    expect(outputs).toEqual(['loss-merged.pdf']);
    expect(fileSha256(path.join(output.path, 'loss-merged.pdf'))).toEqual(
      fileSha256(pkgPath('fiols/testdata/loss-merged.pdf')));
  });
});
