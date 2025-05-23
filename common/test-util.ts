import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { tmpdir } from 'node:os';
import yauzl from 'yauzl-promise';
import type { OnTestFinishedHandler, RunnerTaskResult } from 'vitest';

export class FiolinTmpDir {
  public readonly path: string;

  constructor(onTestFinished?: (cb: OnTestFinishedHandler) => void) {
    this.path = mkdtempSync(path.join(tmpdir(), 'fiol-test-'));
    if (onTestFinished) {
      onTestFinished((ctx) => this.cleanUp(ctx));
    }
  }

  cleanUp(ctx?: RunnerTaskResult) {
    if (ctx?.state == 'fail') {
      console.log('Temp files for failed test run can be found here: ', this.path);
    } else {
      rmSync(this.path, { force: true, recursive: true });
    }
  }
}

export function fileSha256(file: string) {
  const buf = readFileSync(file);
  return createHash('sha256').update(buf).digest('hex');
}

export async function listZip(file: string): Promise<string[]> {
  const zf = await yauzl.open(file);
  try {
    const members = [];
    for await (const entry of zf) {
      members.push(entry.filename);
    }
    members.sort();
    return members;
  } finally {
    await zf.close();
  }
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

