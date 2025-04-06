import { beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import { listZip, FiolinTmpDir } from '../common/test-util';
import { NodeFiolinRunner } from '../utils/runner';
import { readdirSync } from 'node:fs';
import { pkgPath } from '../utils/pkg-path';

describe('extract-tar', () => {
  let output: FiolinTmpDir = new FiolinTmpDir();
  beforeEach(() => { output = new FiolinTmpDir(onTestFinished); });

  async function extractTar(testFile: string): Promise<string[]> {
    const runner = new NodeFiolinRunner('extract-tar', output.path);
    const inputs = [pkgPath(`fiols/testdata/${testFile}`)];
    const outputs = await runner.runWithLocalFs(inputs, {});
    outputs.sort();
    const actual = readdirSync(output.path);
    actual.sort();
    expect(actual).toEqual(outputs);
    return outputs;
  }

  describe('directly unpacks simple tar files', () => {
    // The "simple" tar test files have a foo.txt and bar.txt file in them, and
    // we expect them both to be directly extracted as outputs.
    it('(.tar)', async () => {
      const outputs = await extractTar('simple.tar')
      expect(outputs).toEqual(['bar.txt', 'foo.txt']);
    });
    it('(.tar.gz)', async () => {
      const outputs = await extractTar('simple.tar.gz')
      expect(outputs).toEqual(['bar.txt', 'foo.txt']);
    });
    it('(.tar.bz2)', async () => {
      const outputs = await extractTar('simple.tar.bz2')
      expect(outputs).toEqual(['bar.txt', 'foo.txt']);
    });
    it('(.tbz2)', async () => {
      const outputs = await extractTar('simple.tbz2')
      expect(outputs).toEqual(['bar.txt', 'foo.txt']);
    });
  });

  describe('converts tar files with subdirs to zip', () => {
    // The "tree" tar test files have foo.txt, bar.txt, and sub/baz.txt in them.
    // We expect them both to be converted to a zip file.
    it('(.tar)', async () => {
      let outputs = await extractTar('tree.tar')
      expect(outputs).toEqual(['tree.zip']);
      outputs = await listZip(`${output.path}/tree.zip`);
      expect(outputs).toEqual(['bar.txt', 'foo.txt', 'sub/baz.txt']);
    });
    it('(.tar.gz)', async () => {
      let outputs = await extractTar('tree.tar.gz')
      expect(outputs).toEqual(['tree.zip']);
      outputs = await listZip(`${output.path}/tree.zip`);
      expect(outputs).toEqual(['bar.txt', 'foo.txt', 'sub/baz.txt']);
    });
    it('(.tar.bz2)', async () => {
      let outputs = await extractTar('tree.tar.bz2')
      expect(outputs).toEqual(['tree.zip']);
      outputs = await listZip(`${output.path}/tree.zip`);
      expect(outputs).toEqual(['bar.txt', 'foo.txt', 'sub/baz.txt']);
    });
    it('(.tbz2)', async () => {
      let outputs = await extractTar('tree.tbz2')
      expect(outputs).toEqual(['tree.zip']);
      outputs = await listZip(`${output.path}/tree.zip`);
      expect(outputs).toEqual(['bar.txt', 'foo.txt', 'sub/baz.txt']);
    });
  });
});
