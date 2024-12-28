import { PyodideRunner } from '../common/runner';
import { parseAs } from '../common/parse';
import { mkErrorMessage, InstallPackagesMessage, RunMessage, WorkerMessage } from '../web-utils/types';
import { onlineWasmLoaders } from '../web-utils/loaders';
import { pWorkerMessage } from '../web-utils/parse-msg';
import { FiolinScript } from '../common/types';

// Typed messaging
const _rawPost = self.postMessage;
function postMessage(msg: WorkerMessage) {
  try {
    _rawPost(msg);
  } catch (e) {
    console.error(`Failed to postMessage with argument ${msg}; ${e}`);
    _rawPost(mkErrorMessage(new Error('Unserializable message')));
  }
}
self.onmessage = async (e) => {
  const msg: WorkerMessage = parseAs(pWorkerMessage, e.data);
  await onMessage(msg);
}

let runner: PyodideRunner | undefined = undefined;
async function load(): Promise<void> {
  try {
    const tmp = new PyodideRunner({
      console: {
        debug: (s) => postMessage({ type: 'LOG', level: 'DEBUG', value: s }),
        info: (s) => postMessage({ type: 'LOG', level: 'INFO', value: s }),
        warn: (s) => postMessage({ type: 'LOG', level: 'WARN', value: s }),
        error: (s) => postMessage({ type: 'LOG', level: 'ERROR', value: s }),
      },
      loaders: onlineWasmLoaders(),
    });
    await tmp.loaded;
    runner = tmp;
    postMessage({ type: 'LOADED' });
  } catch (e) {
    postMessage(mkErrorMessage(e));
  }
}
const loaded = load();

let toInstall: FiolinScript | undefined;

async function onMessage(msg: WorkerMessage): Promise<void> {
  if (msg.type === 'INSTALL_PACKAGES') {
    await onInstallPackages(msg);
  } else if (msg.type === 'RUN') {
    await onRun(msg);
  } else {
    throw new Error(`Expected INSTALL_PACKAGES or RUN message; got ${msg}`);
  }
}

async function onRun(msg: RunMessage): Promise<void> {
  await loaded;
  if (!runner) throw new Error(`runner missing after loaded completed`);
  try {
    const response = await runner.run(msg.script, msg.request);
    if (response.error) {
      postMessage(mkErrorMessage(response.error, response.lineno));
    } else {
      postMessage({ type: 'SUCCESS', response });
    }
  } catch (e) {
    postMessage(mkErrorMessage(e));
  }
}

async function onInstallPackages(msg: InstallPackagesMessage): Promise<void> {
  // Only in javascript would it be remotely plausible for this to be correct.
  toInstall = msg.script;
  await loaded;
  if (!toInstall) return;
  const script = toInstall;
  toInstall = undefined;
  if (!runner) throw new Error(`runner missing after loaded completed`);
  try {
    await runner.installPkgs(script);
    postMessage({ type: 'PACKAGES_INSTALLED' });
  } catch (e) {
    postMessage(mkErrorMessage(e));
  }
}
