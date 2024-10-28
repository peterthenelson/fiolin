// Example usage:
// # Run all tests
// $ npx jiti cli/cli.ts test
// # Run the tests for unlock-ppt only
// $ npx jiti cli/cli.ts test unlock-ppt
import { FiolinScript } from '../../common/types';
import { loadAll, loadScript } from '../../utils/config';
import { defineCommand } from 'citty';

export default defineCommand({
  meta: {
    name: 'test',
    description: 'Test the given fiolin script using Node',
  },
  args: {
    name: {
      type: 'positional',
      description: 'The fiolin script to run (runs all of them if not specified)',
      required: false,
    },
  },
  async run({ args }) {
    let scripts: Record<string, FiolinScript> = {};
    if (args.name) {
      const script = loadScript(args.name);
      scripts = { [args.name]: script };
    } else {
      scripts = await loadAll();
    }
    for (const [name, script] of Object.entries(scripts)) {
      // TODO; NOTE: should use mkdtemp for the output dirs
      console.log(`Running tests for ${name}`);
      console.log('NOT IMPLEMENTED');
    }
  },
});
