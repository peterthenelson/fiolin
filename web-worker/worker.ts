import { FiolinJsGlobal } from '../common/types';
import { toErr } from '../web-utils/errors';
import { WorkerMessage } from '../web-utils/types';
import { loadPyodide, PyodideInterface } from 'pyodide';

// TODO: Refactoring to make more use of the shared types.
const shared: FiolinJsGlobal = {
  inFileName: null,
  outFileName: null,
  argv: null,
};
let pyodide: PyodideInterface | null = null;

// Typed messaging
const _rawPost = self.postMessage;
function postMessage(msg: WorkerMessage) {
  _rawPost(msg);
}
self.onmessage = async (e) => {
  const msg: WorkerMessage = (e.data as WorkerMessage);
  await onMessage(msg);
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
    pyodide.setStdout({ batched: (s: string) => postMessage({ type: 'STDOUT', value: s }) });
    pyodide.setStderr({ batched: (s: string) => postMessage({ type: 'STDERR', value: s }) });
    // TODO: Where should I be dealing w/errno codes?
    pyodide.FS.mkdir('/input');
    pyodide.FS.mkdir('/output');
    postMessage({ type: 'LOADED' })
  } catch (e) {
    postMessage({ type: 'ERROR', error: toErr(e) });
  }
}
let loaded = load();

async function onMessage(msg: WorkerMessage) {
  await loaded;
  if (!pyodide) {
    postMessage({ type: 'ERROR', error: new Error('pyodide did not load') });
    return;
  }
  if (msg.type !== 'RUN') {
    throw new Error(`Expected RUN message; got ${msg}`);
  }
  try {
    // TODO: Should be resetting the file system before running.
    const { file, script } = msg;
    if (file) {
      const buf = await readFile(file);
      const inBytes = new Uint8Array(buf);
      shared.inFileName = file.name;
      pyodide.FS.writeFile(`/input/${shared.inFileName}`, inBytes);
    }
    await pyodide.loadPackagesFromImports(script.code.python);
    await pyodide.runPythonAsync(script.code.python);
    if (shared.outFileName) {
      const outBytes = pyodide.FS.readFile(`/output/${shared.outFileName}`);
      const blob = new Blob([outBytes], {type: 'application/octet-stream'});
      postMessage({ type: 'SUCCESS', file: blob, fileName: shared.outFileName });
    } else {
      postMessage({ type: 'SUCCESS' });
    }
  } catch (e) {
    postMessage({ type: 'ERROR', error: toErr(e) });
  }
};
