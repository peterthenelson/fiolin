import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { tmpdir } from 'node:os';
import yauzl from 'yauzl-promise';

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

export async function readFromZip(file: string, member: string): Promise<Buffer> {
  const zf = await yauzl.open(file);
  try {
    for await (const entry of zf) {
      if (entry.filename !== member) {
        continue;
      }
      const stream = await entry.openReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
    throw new Error(`${member} not found in ${file}`);
  } finally {
    await zf.close();
  }
}
