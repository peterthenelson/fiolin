import { RunMessage, WorkerMessage } from '../web-utils/types';
import { getErrMsg, toErr } from '../web-utils/errors';
import { asFiolinScript } from '../common/parse';
import { FiolinScript } from '../common/types';

function getElementByIdAs<T extends HTMLElement>(id: string, cls: new (...args: any[])=> T): T {
  const elem = document.getElementById(id);
  if (elem === null) {
    throw new Error(`Element #${id} not found`);
  } else if (elem instanceof cls) {
    return (elem as T);
  } else {
    throw new Error(`Element #${id} is not an instance of ${cls}`);
  }
}

const scriptSrc = getElementByIdAs('script-src', HTMLSpanElement);
const scriptPane = getElementByIdAs('script-pane', HTMLTextAreaElement);
scriptPane.value = 'Loading...';
const fileChooser = getElementByIdAs('file-chooser', HTMLInputElement);
const outputPane = getElementByIdAs('output-pane', HTMLTextAreaElement);
outputPane.value = 'Loading...';

const worker = new Worker('./worker.js', { type: 'classic' });

worker.onerror = (e) => {
  console.error(getErrMsg(e));
  outputPane.value = getErrMsg(e);
};

const defaultScript: string = `# Basic script that copies input to output
import js
import os.path

infname = os.path.join('/input', js.inFileName)
stem, ext = os.path.splitext(js.inFileName)
js.outFileName = stem + '-copy' + ext
outfname = os.path.join('/output', js.outFileName)

with open(infname, 'rb') as infile:
  print(f'opened {infname} (to read)')
  with open(outfname, 'wb') as outfile:
    print(f'opened {outfname} (to write)')
    outfile.write(infile.read())
  print('copied input to output')
`;

async function fetchScript() {
  const s = (new URLSearchParams(window.location.search)).get('s');
  if (s === null) {
    scriptSrc.textContent = 'Script playground:';
    scriptPane.value = defaultScript;
    return;
  }
  try {
    scriptSrc.textContent = s;
    scriptPane.value = `Fetching script from\n${s}`;
    const resp = await fetch(s);
    const parsed = await resp.json();
    console.log(parsed);
    const script: FiolinScript = asFiolinScript(parsed);
    scriptSrc.textContent = script.meta.title;
    scriptSrc.title = script.meta.description;
    scriptPane.value = script.code.python;
  } catch (e) {
    console.log('Failed to fetch script!');
    const err = toErr(e);
    console.error(err);
    scriptPane.value = (
      `Failed to fetch script from\n${s}\n${err.message}`);
  }
}
const fetched = fetchScript();

function runScript() {
  outputPane.value = '';
  const file = fileChooser.files![0];
  const msg: RunMessage = { type: 'RUN', file, script: scriptPane.value };
  worker.postMessage(msg);
}

worker.onmessage = async (e) => {
  const msg: WorkerMessage = e.data as WorkerMessage;
  if (msg.type === 'LOADED') {
    outputPane.value = 'Pyodide Loaded';
    await fetched;
    fileChooser.disabled = false;
    fileChooser.onchange = runScript;
  } else if (msg.type === 'STDOUT') {
    outputPane.value += msg.value + '\n';
  } else if (msg.type === 'STDERR') {
    console.warn(msg.value);
    outputPane.value += msg.value + '\n';
  } else if (msg.type === 'SUCCESS') {
    if (msg.fileName && msg.file) {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(msg.file);
      elem.download = msg.fileName;
      document.body.appendChild(elem);
      elem.click();        
      document.body.removeChild(elem);
    } else {
      outputPane.value += (
          '='.repeat(30) + '\nScript did not produce an output file.\n');
    }
  } else if (msg.type === 'ERROR') {
    console.warn(msg.error);
    outputPane.value = msg.error.toString();
  } else {
    outputPane.value = `Unexpected event data: ${msg}`;
    console.error(`Unexpected event data: ${msg}`);
  }
};
