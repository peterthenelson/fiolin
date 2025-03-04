import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FiolinTmpDir } from './test-util';
import { NodeFiolinRunner } from '../utils/runner';
import { pkgPath } from '../utils/pkg-path';

describe('favicon', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();

  beforeEach(() => { output = new FiolinTmpDir(); });
  afterEach(() => { output.cleanUp(); });

  it('writes rotated', async () => {
    // TODO
  });
});


