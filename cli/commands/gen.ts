import { loadAll, loadScript } from '../../utils/config';
import { defineCommand } from 'citty';
import { existsSync, mkdirSync, rmSync, watch, writeFileSync } from 'node:fs';
import path from 'node:path';
import { FiolinScript } from '../../common/types';

async function tryReloadFiol(name: string) {
  try {
    const script = loadScript(name);
    console.log(`Generating server/s/${name}.json`);
    const json = JSON.stringify(script, null, 2);
    writeFileSync(`server/public/s/${name}.json`, json);
  } catch (e) {
    console.error(`Failed to generate json for fiol ${name}`);
    console.error(e);
    rmSync(`server/public/s/${name}.json`, { force: true });
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
    console.log('Recreating server/public/s');
    rmSync('server/public/s', { force: true, recursive: true });
    mkdirSync('server/public/s');
    const scripts: Record<string, FiolinScript> = await loadAll();
    for (const [name, script] of Object.entries(scripts)) {
      console.log(`Generating server/s/${name}.json`);
      const json = JSON.stringify(script, null, 2);
      writeFileSync(`server/public/s/${name}.json`, json);
    }
    if (args.watch) {
      // TODO: use __dirname or whatever to make this cwd agnostic
      watch('fiols', { persistent: true, recursive: false }, (type, fileName) => {
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
          if (existsSync(path.join('fiols', fileName))) {
            console.log(`Fiol added: ${name}`)
            tryReloadFiol(name);
          } else {
            console.log(`Fiol removed: ${name}; removing generated json`);
            rmSync(`server/public/s/${name}.json`, { force: true });
          }
        } else if (type === 'change') {
          tryReloadFiol(name);
        }
      });
    }
  },
});
