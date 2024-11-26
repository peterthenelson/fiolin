import { FiolinScript } from '../common/types';
import { readdirSync, readFileSync } from 'node:fs';
import { pkgPath } from './pkg-path';
import { scriptFromYml } from '../common/script-from-yml';

function load(dir: string, name: string): FiolinScript {
  const yml = readFileSync(pkgPath(`${dir}/${name}.yml`), 'utf-8');
  const py = readFileSync(pkgPath(`${dir}/${name}.py`), 'utf-8');
  return scriptFromYml(yml, py);
}

async function loadDir(dir: string): Promise<Record<string, FiolinScript>> {
  const files = readdirSync(pkgPath(dir));
  const scripts: Record<string, FiolinScript> = {};
  for (const f of files) {
    if (f.endsWith('.yml')) {
      const name = f.substring(0, f.length - 4);
      scripts[name] = load(dir, name);
    }
  }
  return scripts;
}

export function loadScript(name: string): FiolinScript {
  return load('fiols', name);
}

export async function loadAll(): Promise<Record<string, FiolinScript>> {
  return loadDir('fiols');
}

export function loadTutorial(name: string): FiolinScript {
  return load('tutorial', name);
}

export async function loadAllTutorials(): Promise<Record<string, FiolinScript>> {
  return loadDir('tutorial');
}
