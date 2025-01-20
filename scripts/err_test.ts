/** Test suite for error propagation */
import { FiolinScript } from '../common/types';
import { PyodideRunner } from '../common/runner';
import { offlineWasmLoaders } from '../utils/loaders';
import { pkgPath } from '../utils/pkg-path';

const numInits = 1000;
const numRunsPerInit = 1000;
interface Stats {
  totalFails: number;
  nInits: number;
  nRuns: number;
  runPatterns: boolean[][];
}
const stats: Stats = { totalFails: 0, nInits: 0, nRuns: 0, runPatterns: [] };
const script: FiolinScript = {
  meta: { title: 'fail-with-asdf', description: '' },
  interface: { inputFiles: 'NONE', outputFiles: 'NONE' },
  runtime: {},
  code: { python: 'import fiolin\nfiolin.form_set_focus("foo")\n' }
};

function init() {
  return new PyodideRunner({
    indexUrl: pkgPath('node_modules/pyodide'),
    loaders: offlineWasmLoaders(),
    console: { info() {}, debug() {}, warn() {}, error() {} },
  });
}

async function run(runner: PyodideRunner): Promise<boolean> {
  const response = await runner.run(script, { inputs: [] });
  if (response.error) {
    return !!response.error.message.match(/component.*foo/);
  }
  throw new Error('Script unexpectedly ended w/o any error at all');
}

function rle(runPattern: boolean[]): string {
  const run: boolean[] = [];
  let s = '';
  for (const b of runPattern) {
    if (run.length !== 0 && run.at(-1) !== b) {
      s += `${run.at(-1) ? 'T' : 'F'}${run.length}`;
      run.length = 0;
    }
    run.push(b)
  }
  s += `${run.at(-1) ? 'T' : 'F'}${run.length}`;
  return s;
}

function report_stats() {
  if (stats.nRuns % 100 === 0) {
    const [a, b, c] = [stats.totalFails, stats.nInits, stats.nRuns];
    console.log(`{ totalFails: ${a}, nInits: ${b}, nRuns: ${c} }`);
    let nonPrefixFails = 0;
    for (const rp of stats.runPatterns) {
      let i = 0;
      while (!rp[i] && i < rp.length) i++;
      for (; i < rp.length; i++) {
        nonPrefixFails += rp[i] ? 0 : 1;
      }
    }
    console.log(`nonPrefixFails = ${nonPrefixFails}`)
    //const uniq = [...new Set(stats.runPatterns.map(rle))];
    //console.log(`unique runPatterns: = ${uniq}`);
  }
}

for (let i = 0; i < numInits; i++) {
  const runner = init();
  stats.nInits++;
  const runPattern: boolean[] = [];
  for (let j = 0; j < numRunsPerInit; j++) {
    const success = await run(runner);
    stats.nRuns++;
    stats.totalFails += (!success) ? 1 : 0;
    runPattern.push(success);
    report_stats();
  }
  if (runPattern.includes(false)) {
    stats.runPatterns.push(runPattern);
  }
}
