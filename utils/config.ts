import { FiolinScript, FiolinScriptTemplate } from '../common/types';
import { readdirSync, readFileSync } from 'node:fs';
import { pkgPath } from './pkg-path';
import { asFiolinScript } from '../common/parse';

export function loadScript(name: string): FiolinScript {
  const templatePath = pkgPath(`fiols/${name}.fiol`);
  const template = JSON.parse(readFileSync(templatePath, 'utf-8'));
  const python = readFileSync(pkgPath(`fiols/${name}.py`), 'utf-8');
  const script = { code: { python }, ...template };
  return asFiolinScript(script);
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
