import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { tmpdir } from 'node:os';

export class FiolinTmpDir {
  public readonly path: string;

  constructor() {
    this.path = mkdtempSync(path.join(tmpdir(), 'fiol-test-'));
  }

  cleanUp() {
    rmSync(this.path, { force: true, recursive: true });
  }
}

export function fileSha256(file: string) {
  const buf = readFileSync(file);
  return createHash('sha256').update(buf).digest('hex');
}
