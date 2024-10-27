import { FiolinScript, FiolinScriptTemplate } from '../common/types';
import { readdirSync, readFileSync } from 'node:fs';

// TODO: Use __dirname or import.meta.dirname instead of assuming the current
// working directory is the project root.

export async function loadScript(name: string): Promise<FiolinScript> {
  // TODO: Better 'not found' error message.
  const module = await import(`../fiols/${name}.ts`);
  const python = readFileSync(`fiols/${name}.py`, 'utf-8');
  if (Object.hasOwn(module, 'config')) {
    // TODO: Validate
    const template: FiolinScriptTemplate = (module.config as FiolinScriptTemplate);
    return { python, ...template };
  } else {
    throw new Error(`Expected ../fiols/${name}.ts to export config`)
  }
}

export async function loadAll(): Promise<Record<string, FiolinScript>> {
  const files = readdirSync('fiols');
  const scripts: Record<string, FiolinScript> = {};
  for (const f of files) {
    if (f.endsWith('.ts') && !f.endsWith('.test.ts')) {
      const name = f.substring(0, f.length - 3);
      scripts[name] = await loadScript(name);
    }
  }
  return scripts;
}
