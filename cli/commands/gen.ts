import { loadAll } from '../../utils/config';
import { defineCommand } from 'citty';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { FiolinScript } from '../../common/types';

export default defineCommand({
  meta: {
    name: 'test',
    description: 'Test the given fiolin script using Node',
  },
  async run() {
    console.log('Recreating server/public/s');
    rmSync('server/public/s', { force: true, recursive: true });
    mkdirSync('server/public/s');
    const scripts: Record<string, FiolinScript> = await loadAll();
    for (const [name, script] of Object.entries(scripts)) {
      console.log(`Generating server/s/${name}.json`);
      const json = JSON.stringify(script, null, 2);
      writeFileSync(`server/public/s/${name}.json`, json);
    }
  },
});
