import { pkgPath } from '../utils/pkg-path';
import { indent } from '../common/indent';
import { readFileSync } from 'node:fs';

export function loadSvg(name: string): string {
  return indent(
    readFileSync(pkgPath(`server/public/${name}.svg`), { encoding: 'utf-8' }),
    '          ');
}