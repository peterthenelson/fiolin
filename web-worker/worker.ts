import { PyodideRunner } from '../common/runner';
import { toErr } from '../common/errors';
import { WorkerMessage } from '../web-utils/types';

// Typed messaging
const _rawPost = self.postMessage;
function postMessage(msg: WorkerMessage) {
  _rawPost(msg);
}
self.onmessage = async (e) => {
  const msg: WorkerMessage = (e.data as WorkerMessage);
  await onMessage(msg);
}

let runner: PyodideRunner | undefined = undefined;
async function load() {
  try {
    const tmp = new PyodideRunner({
      console: {
        log: (s) => postMessage({ type: 'STDOUT', value: s }),
        error: (s) => postMessage({ type: 'STDERR', value: s }),
      },
    });
    await tmp.loaded;
    runner = tmp;
    postMessage({ type: 'LOADED' });
  } catch (e) {
    postMessage({ type: 'ERROR', error: toErr(e) });
  }
}
load();

async function onMessage(msg: WorkerMessage) {
  if (msg.type !== 'RUN') {
    throw new Error(`Expected RUN message; got ${msg}`);
  }
  if (!runner) {
    throw new Error('RUN message sent before runner loaded');
  }
  try {
    const response = await runner.run(msg.script, msg.request);
    if (response.error) {
      postMessage({ type: 'ERROR', error: response.error, lineno: response.lineno });
    } else {
      postMessage({ type: 'SUCCESS', response });
    }
  } catch (e) {
    postMessage({ type: 'ERROR', error: toErr(e) });
  }
};
