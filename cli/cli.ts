import { defineCommand, runMain } from 'citty';

const main = defineCommand({
  meta: {
    name: 'fiolin',
    version: '1.0.0',
    description: 'CLI to run/test/generate fiolin scripts',
  },
  subCommands: {
    gen: () => import('./commands/gen').then((r) => r.default),
    run: () => import('./commands/run').then((r) => r.default),
  }
})

runMain(main);
