importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js");

shared = {
  inFileName: null,
  outFileName: null,
};

function simpleMsg(t, v) {
  return { type: t, value: v };
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.result);
    reader.readAsArrayBuffer(file);
  });
}

async function load() {
  let pyodide = await loadPyodide({ jsglobals: shared });
  self.pyodide = pyodide;
  pyodide.setStdout({ batched: (s) => { self.postMessage(simpleMsg('STDOUT', s)); } });
  pyodide.setStderr({ batched: (s) => { self.postMessage(simpleMsg('STDERR', s)); } });
  // TODO: Where should I be dealing w/errno codes?
  pyodide.FS.mkdir('/input');
  pyodide.FS.mkdir('/output');
  postMessage({ type: 'LOADED' })
}
let loaded = load();

self.onmessage = async (e) => {
  await loaded;
  if (e.data.type !== 'RUN') {
    throw new Error(`Expected RUN message; got ${e.data}`);
  }
  try {
    const { file, script } = e.data;
    const buf = await readFile(file);
    const inBytes = new Uint8Array(buf);
    shared.inFileName = file.name;
    self.pyodide.FS.writeFile(`/input/${shared.inFileName}`, inBytes);
    await self.pyodide.loadPackagesFromImports(script);
    await self.pyodide.runPythonAsync(script);
    const outBytes = self.pyodide.FS.readFile(`/output/${shared.outFileName}`);
    const blob = new Blob([outBytes], {type: 'application/octet-stream'});
    postMessage({ type: 'SUCCESS', file: blob, fileName: shared.outFileName });
  } catch (e) {
    postMessage({ type: 'ERROR', error: e });
  }
};
