import { FiolinScript } from '../common/types';
import { readdirSync, readFileSync } from 'node:fs';
import { pkgPath } from './pkg-path';
import { scriptFromYml } from '../common/script-from-yml';

export function loadScript(name: string): FiolinScript {
  const yml = readFileSync(pkgPath(`fiols/${name}.yml`), 'utf-8');
  const py = readFileSync(pkgPath(`fiols/${name}.py`), 'utf-8');
  return scriptFromYml(yml, py);
}

export async function loadAll(): Promise<Record<string, FiolinScript>> {
  const files = readdirSync(pkgPath('fiols'));
  const scripts: Record<string, FiolinScript> = {};
  for (const f of files) {
    if (f.endsWith('.yml')) {
      const name = f.substring(0, f.length - 4);
      scripts[name] = loadScript(name);
    }
  }
  return scripts;
}
