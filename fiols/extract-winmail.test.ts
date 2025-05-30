import { beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import { FiolinTmpDir } from '../common/test-util';
import { NodeFiolinRunner } from '../utils/runner';
import { readdirSync } from 'node:fs';
import { pkgPath } from '../utils/pkg-path';

describe('extract-winmail', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();
  beforeEach(() => { output = new FiolinTmpDir(onTestFinished); });

  it('unpacks attachments', async () => {
    const runner = new NodeFiolinRunner('extract-winmail', output.path);
    // The TNEF file fiols/testdata/winmail.dat is copied from 
    // https://github.com/gatewayapps/node-tnef/tree/master/testFiles/attachment.dat
    // As such, it is Copyright (c) 2021 Gateway Apps, LLC and available under
    // the MIT license (the same license as Fiolin's source code).
    const inputs = [pkgPath('fiols/testdata/winmail.dat')];
    const outputs = await runner.runWithLocalFs(inputs, {});
    outputs.sort();
    expect(outputs).toEqual(['ZAPPA_~2.JPG', 'bookmark.htm']);
    const actual = readdirSync(output.path);
    actual.sort();
    expect(actual).toEqual(outputs);
  });
});
