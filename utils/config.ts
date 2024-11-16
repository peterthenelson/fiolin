import { FiolinScript } from '../common/types';
import { readdirSync, readFileSync } from 'node:fs';
import { pkgPath } from './pkg-path';
import { pFiolinScript } from '../common/parse-script';
import { parseAs } from '../common/parse';
import jsonc, { printParseErrorCode } from 'jsonc-parser';

function offsetToLC(s: string, offset: number): [number, number] {
  const line = s.slice(0, offset).split('\n').length;
  const column = offset - s.lastIndexOf('\n', offset - 1);
  return [line, column];
}

export class FiolinScriptParseError extends Error {
  public offset: number;
  public line: number;
  public column: number;

  constructor(msg: string, offset: number, line: number, column: number) {
    super(msg);
    this.offset = offset;
    this.line = line;
    this.column = column;
  }
};

function wrapJsoncParseError(fileName: string, content: string, offset: number, msg: string): FiolinScriptParseError {
  const [line, col] = offsetToLC(content, offset);
  return new FiolinScriptParseError(
    `Error parsing ${fileName} at line ${line}, column ${col}: ${msg}`,
    offset, line, col);
}

function readJsonc(fileName: string): any {
  const content = readFileSync(fileName, 'utf-8');
  const errors: jsonc.ParseError[] = [];
  let parsed: any = undefined;
  try {
    parsed = jsonc.parse(content, errors, { allowTrailingComma: true });
  } catch (error) {
    if (error instanceof Error && 'offset' in error && typeof error.offset === 'number') {
      const { message, offset } = error;
      throw wrapJsoncParseError(fileName, content, offset, message)
    } else {
      console.error(`Unexpected type of error:`);
      console.error(error);
      throw error;
    }
  }
  for (const e of errors) {
    throw wrapJsoncParseError(fileName, content, e.offset, printParseErrorCode(e.error));
  }
  return parsed;
}

export function loadScript(name: string): FiolinScript {
  // TODO: Use some kind of templating to substitute in python instead of just
  // hard-coding this.
  const template = readJsonc(pkgPath(`fiols/${name}.fiol`));
  const python = readFileSync(pkgPath(`fiols/${name}.py`), 'utf-8');
  const script = { code: { python }, ...template };
  return parseAs(pFiolinScript, script);
}

export async function loadAll(): Promise<Record<string, FiolinScript>> {
  const files = readdirSync(pkgPath('fiols'));
  const scripts: Record<string, FiolinScript> = {};
  for (const f of files) {
    if (f.endsWith('.fiol')) {
      const name = f.substring(0, f.length - 5);
      scripts[name] = loadScript(name);
    }
  }
  return scripts;
}
