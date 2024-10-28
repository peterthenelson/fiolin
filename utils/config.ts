import { FiolinScript, FiolinScriptTemplate } from '../common/types';
import { readdirSync, readFileSync } from 'node:fs';

// TODO: Use __dirname or import.meta.dirname instead of assuming the current
// working directory is the project root.

export function loadScript(name: string): FiolinScript {
  // TODO: Better 'not found' error message.
  // TODO: Validate
  const template = (JSON.parse(readFileSync(`fiols/${name}.fiol`, 'utf-8')) as FiolinScriptTemplate);
  const python = readFileSync(`fiols/${name}.py`, 'utf-8');
  return { python, ...template };
}

export async function loadAll(): Promise<Record<string, FiolinScript>> {
  const files = readdirSync('fiols');
  const scripts: Record<string, FiolinScript> = {};
  for (const f of files) {
    if (f.endsWith('.fiol')) {
      const name = f.substring(0, f.length - 5);
      scripts[name] = loadScript(name);
    }
  }
  return scripts;
}
