// Example usages:
// # Run unlock-ppt with one input file (locked.ppt) and outputs dumped in .
// $ npx jiti cli/cli.ts run unlock-ppt --input locked.ppt --outputDir .
import { loadScript } from '../../utils/config';
import { PyodideRunner } from '../../utils/runner';
import { FiolinRunRequest } from '../../common/types';
import { defineCommand } from 'citty';

function validateInputs(inputs: undefined | string | boolean | string[]): string[] {
  if (typeof inputs === 'boolean') {
    throw new Error(`--input must be a string or array of strings; got ${inputs}`);
  } else if (inputs === undefined) {
    return [];
  } else if (typeof inputs === 'string') {
    return [inputs];
  } else {
    return inputs;
  }
}

export default defineCommand({
  meta: {
    name: 'run',
    description: 'Run the given fiolin script using Node',
  },
  args: {
    name: {
      type: 'positional',
      description: 'The fiolin script to run',
      required: true,
    },
    input: {
      // This is logically a string or array of strings, but we have to manually
      // validate this in run().
      description: 'Input file (or files)',
    },
    outputDir: {
      type: 'string',
      description: 'Directory to put output files in',
    },
    argv: {
      type: 'string',
      description: 'Arguments to pass to the script',
    }
  },
  async run({ args }) {
    const script = loadScript(args.name);
    const runner = new PyodideRunner(script, console);
    const inputs = validateInputs(args.input);
    const { outputDir, argv } = args;
    const request: FiolinRunRequest = { inputs, outputDir, argv };
    await runner.run(request, (response) => {
      if (response.error) {
        console.error(response.error.message);
      }
    });
  },
});
