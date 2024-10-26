const scriptSrc = document.getElementById('script-src');
const scriptPane = document.getElementById('script-pane');
scriptPane.value = 'Loading...';
const fileChooser = document.getElementById('file-chooser');
const outputPane = document.getElementById('output-pane');
outputPane.value = 'Loading...';
const worker = new Worker('./worker.js');
const defaultScript = `# Basic script that copies input to output
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
    scriptSrc.textContent = parsed['title'];
    scriptSrc.title = parsed['description'];
    scriptPane.value = parsed['py'];
  } catch (e) {
    console.log('Failed to fetch script!');
    console.error(e);
    scriptPane.value = (
      `Failed to fetch script from\n${s}\n${e.message}`);
  }
}
const fetched = fetchScript();

function runScript() {
  outputPane.value = '';
  const file = fileChooser.files[0];
  worker.postMessage({ type: 'RUN', file, script: scriptPane.value });
}

worker.onerror = (e) => {
  // WTF type is e?
  console.error(e);
  outputPane.value = e.toString();
};

worker.onmessage = async (e) => {
  if (e.data.type === 'LOADED') {
    outputPane.value = 'Pyodide Loaded';
    await fetched;
    fileChooser.disabled = false;
    fileChooser.onchange = runScript;
  } else if (e.data.type === 'STDOUT') {
    outputPane.value += e.data.value + '\n';
  } else if (e.data.type === 'STDERR') {
    console.warn(e.data.value);
    outputPane.value += e.data.value + '\n';
  } else if (e.data.type === 'SUCCESS') {
    if (e.data.fileName) {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(e.data.file);
      elem.download = e.data.fileName;
      document.body.appendChild(elem);
      elem.click();        
      document.body.removeChild(elem);
    } else {
      outputPane.value += (
          '='.repeat(30) + '\nScript did not produce an output file.\n');
    }
  } else if (e.data.type === 'ERROR') {
    console.warn(e.data.error);
    outputPane.value = e.data.error.toString();
  } else {
    const msg = `Unexpected event data: ${e.data}`;
    outputPane.value = msg;
    console.error(msg);
  }
};
