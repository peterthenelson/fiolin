// Example usages:
// # Run unlock-ppt with one input file (locked.ppt) and outputs dumped in .
// $ npx jiti cli/cli.ts run unlock-ppt --input locked.ppt --outputDir .
import { NodeFiolinRunner } from '../../utils/runner';
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

function validateOneArg(s: string): [string, string] {
  const i = s.indexOf('=');
  if (i < 0) {
    throw new Error(`Each --arg must have an equals sign, but got ${s}`);
  }
  return [s.substring(0, i), s.substring(i + 1)];
}

function validateInnerArgs(args: undefined | string | boolean | string[]): Record<string, string> {
  const innerArgs: Record<string, string> = {};
  if (typeof args === 'boolean') {
    throw new Error(`--arg must be a string or array of strings; got ${args}`);
  } else if (typeof args === 'undefined') {
    // Nothing
  } else if (typeof args === 'string') {
    const [k, v] = validateOneArg(args);
    innerArgs[k] = v;
  } else {
    for (const s of args) {
      const [k, v] = validateOneArg(s);
      innerArgs[k] = v;
    }
  }
  return innerArgs;
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
      // Logically a string or array of strings, but we have to validate it.
      description: 'Input file (or files)',
    },
    outputDir: {
      type: 'string',
      description: 'Directory to put output files in',
      required: true,
    },
    arg: {
      // Logically a string or array of strings, but we have to validate it.
      description: 'Arguments to pass to the script',
    }
  },
  async run({ args }) {
    const inputPaths = validateInputs(args.input);
    const innerArgs = validateInnerArgs(args.arg);
    const runner = new NodeFiolinRunner(args.name, args.outputDir);
    await runner.runWithLocalFs(inputPaths, { args: innerArgs });
  },
});
