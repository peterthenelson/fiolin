import { defineCommand, runMain } from 'citty';

// TODO: Eventually make this so people can use as an offline toolchain to
// develop their own fiols rather than just for use w/1p scripts.
const main = defineCommand({
  meta: {
    name: 'fiolin',
    version: '1.0.0',
    description: 'CLI to run fiolin scripts',
  },
  subCommands: {
    run: () => import('./commands/run').then((r) => r.default),
  }
})

runMain(main);
