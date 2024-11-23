import { FiolinScript } from '../common/types';
import { pFiolinScript } from '../common/parse-script';
import { parseAs } from '../common/parse';
import YAML from 'yaml';

function offsetToLC(s: string, offset: number): [number, number] {
  const line = s.slice(0, offset).split('\n').length;
  const column = offset - s.lastIndexOf('\n', offset - 1);
  return [line, column];
}

export function scriptFromYml(ymlContents: string, pyContents: string): FiolinScript {
  // TODO: file/line/column errors?
  const template = YAML.parse(ymlContents);
  const script = { code: { python: pyContents }, ...template };
  return parseAs(pFiolinScript, script);
}