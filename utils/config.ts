import { FiolinScript, FiolinScriptTemplate } from '../common/types';
import { readdirSync, readFileSync } from 'node:fs';
import { pkgPath } from './pkg-path';

export function loadScript(name: string): FiolinScript {
  const templatePath = pkgPath(`fiols/${name}.fiol`);
  // TODO: Validate that it's a FiolinScriptTemplate.
  const template = (JSON.parse(readFileSync(templatePath, 'utf-8')) as FiolinScriptTemplate);
  const python = readFileSync(pkgPath(`fiols/${name}.py`), 'utf-8');
  return { python, ...template };
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
