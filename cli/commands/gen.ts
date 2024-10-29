import { loadAll, loadScript } from '../../utils/config';
import { defineCommand } from 'citty';
import { existsSync, mkdirSync, rmSync, watch, writeFileSync } from 'node:fs';
import { FiolinScript } from '../../common/types';
import { pkgPath } from '../../utils/pkg-path';

async function tryReloadFiol(name: string) {
  const jsonPath = pkgPath(`server/public/s/${name}.json`);
  try {
    const script = loadScript(name);
    console.log(`Generating json for ${name}.fiol`);
    const json = JSON.stringify(script, null, 2);
    writeFileSync(jsonPath, json);
  } catch (e) {
    console.error(`Failed to generate json for ${name}.fiol`);
    console.error(e);
    rmSync(jsonPath, { force: true });
  }
}

export default defineCommand({
  meta: {
    name: 'test',
    description: 'Test the given fiolin script using Node',
  },
  args: {
    watch: {
      type: 'boolean',
      description: 'Run in watch mode',
    },
  },
  async run({ args }) {
    const fiolOutputDir = pkgPath('server/public/s');
    console.log('Recreating directory of generated fiol json');
    rmSync(fiolOutputDir, { force: true, recursive: true });
    mkdirSync(fiolOutputDir);
    const scripts: Record<string, FiolinScript> = await loadAll();
    for (const [name, script] of Object.entries(scripts)) {
      console.log(`Generating json for ${name}.fiol`);
      const json = JSON.stringify(script, null, 2);
      writeFileSync(pkgPath(`server/public/s/${name}.json`), json);
    }
    if (args.watch) {
      watch(pkgPath('fiols'), { persistent: true, recursive: false }, (type, fileName) => {
        if (!fileName) return;
        if (fileName === 'js.py') return;
        let name = '';
        if (fileName.endsWith('.py')) {
          name = fileName.substring(0, fileName.length - 3);
        } else if (fileName.endsWith('.fiol')) {
          name = fileName.substring(0, fileName.length - 5);
        } else {
          return;
        }
        if (type === 'rename') {
          if (existsSync(pkgPath(`fiols/${fileName}`))) {
            console.log(`Fiol added: ${name}`)
            tryReloadFiol(name);
          } else {
            console.log(`Fiol removed: ${name}; removing generated json`);
            rmSync(pkgPath(`server/public/s/${name}.json`), { force: true });
          }
        } else if (type === 'change') {
          tryReloadFiol(name);
        }
      });
    }
  },
});
