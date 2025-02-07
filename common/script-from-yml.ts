import { FiolinScript } from '../common/types';
import { pFiolinScript } from '../common/parse-script';
import { parseAs } from '../common/parse';
import YAML from 'yaml';

export function scriptFromYml(ymlContents: string, pyContents: string): FiolinScript {
  const template = YAML.parse(ymlContents, { prettyErrors: true });
  const script = { code: { python: pyContents }, ...template };
  return parseAs(pFiolinScript, script);
}