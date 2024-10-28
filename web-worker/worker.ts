import { toErr } from '../web-utils/errors';
import { WorkerMessage } from '../web-utils/types';
import { loadPyodide, PyodideInterface } from 'pyodide';

const shared = {
  inFileName: null,
  outFileName: null,
  argv: null,
};
let pyodide: PyodideInterface | null = null;

function post(msg: WorkerMessage) {
  postMessage(msg);
}

function readFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result === null) {
        console.log(`Loading file returned null`);
        reject(reader.result);
      } else if (typeof reader.result === 'string') {
        const enc = new TextEncoder();
        resolve(enc.encode(reader.result));
      } else {
        resolve(reader.result)
      }
    };
    reader.onerror = () => reject(reader.result);
    reader.readAsArrayBuffer(file);
  });
}

async function load() {
  try {
    pyodide = await loadPyodide({ jsglobals: shared });
    pyodide.setStdout({ batched: (s: string) => post({ type: 'STDOUT', value: s }) });
    pyodide.setStderr({ batched: (s: string) => post({ type: 'STDERR', value: s }) });
    // TODO: Where should I be dealing w/errno codes?
    pyodide.FS.mkdir('/input');
    pyodide.FS.mkdir('/output');
    post({ type: 'LOADED' })
  } catch (e) {
    post({ type: 'ERROR', error: toErr(e) });
  }
}
let loaded = load();

self.onmessage = async (e) => {
  await loaded;
  if (!pyodide) {
    post({ type: 'ERROR', error: new Error('pyodide did not load') });
    return;
  }
  if (e.data.type !== 'RUN') {
    throw new Error(`Expected RUN message; got ${e.data}`);
  }
  try {
    const { file, script } = e.data;
    const buf = await readFile(file);
    const inBytes = new Uint8Array(buf);
    shared.inFileName = file.name;
    pyodide.FS.writeFile(`/input/${shared.inFileName}`, inBytes);
    await pyodide.loadPackagesFromImports(script);
    await pyodide.runPythonAsync(script);
    if (shared.outFileName) {
      const outBytes = pyodide.FS.readFile(`/output/${shared.outFileName}`);
      const blob = new Blob([outBytes], {type: 'application/octet-stream'});
      post({ type: 'SUCCESS', file: blob, fileName: shared.outFileName });
    } else {
      post({ type: 'SUCCESS' });
    }
  } catch (e) {
    post({ type: 'ERROR', error: toErr(e) });
  }
};
