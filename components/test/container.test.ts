/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { renderContainer, FiolinContainerOptions } from '../server/container';
import { Container, ContainerOpts } from '../web/container';
import { dedent } from '../../common/indent';
import { loadAllTutorials, loadScript } from '../../utils/config';
import { WorkerMessage } from '../../web-utils/types';
import { LoaderComponent } from '../web/loader-component';
import { FiolinScript } from '../../common/types';
import { Deferred } from '../../common/deferred';

class FakeWorker {
  public messages: WorkerMessage[];
  public toNotify: Deferred<WorkerMessage>[];
  public onmessage: ((msg: WorkerMessage) => void) | null;
  public onerror: ((ev: ErrorEvent) => void) | null;

  constructor() {
    this.messages = [];
    this.toNotify = [];
    this.onmessage = null;
    this.onerror = null;
  }

  postMessage(msg: WorkerMessage, transfer?: Transferable[]) {
    console.log(msg.type);
    if (this.toNotify.length > 0) {
      const d = this.toNotify.shift();
      d?.resolve(msg);
    } else {
      this.messages.push(msg);
    }
  }

  async next(): Promise<WorkerMessage> {
    if (this.messages.length > 0) {
      return this.messages.shift()!;
    } else {
      const d = new Deferred<WorkerMessage>();
      this.toNotify.push(d);
      return d.promise;
    }
  }
}

class FakeLoader extends LoaderComponent {
  private readonly script: FiolinScript;

  constructor(script: FiolinScript) {
    super();
    this.script = script;
  }

  isEnabled(): boolean { return true; }

  async load(): Promise<FiolinScript> {
    return this.script;
  }
}

describe('container', () => {
  describe('rendering and initialization', () => {
    it('works for 1p', async () => {
      const script = loadScript('extract-winmail');
      const serverOpts: FiolinContainerOptions = {
        mode: '1P', script, numSpaces: 4,
      };
      document.write(dedent(`
        <html>
          <body>
            ${renderContainer(serverOpts)}
          </body>
        </html>
      `));
      const worker = new FakeWorker();
      const clientOpts: ContainerOpts = {
        type: '1P',
        fiol: 'extract-winmail',
        test: { worker, loader: new FakeLoader(script) },
      };
      const containerDiv = document.getElementById('container');
      expect(containerDiv).not.toEqual(null);
      const container = new Container(containerDiv!, clientOpts);
      const install = await worker.next();
      expect(install.type).toEqual('INSTALL_PACKAGES')
      worker.onmessage!({ type: 'LOADED' });
      worker.onmessage!({ type: 'PACKAGES_INSTALLED' });
      // TODO: mock out editor and await container.readyToRun.promise;
    });

    it('works for playground', async () => {
      const tutorials = await loadAllTutorials();
      const serverOpts: FiolinContainerOptions = {
        mode: 'PLAYGROUND', tutorials, numSpaces: 4,
      };
      document.write(dedent(`
        <html>
          <body>
            ${renderContainer(serverOpts)}
          </body>
        </html>
      `));
      const worker = new FakeWorker();
      const clientOpts: ContainerOpts = {
        type: 'PLAYGROUND',
        tutorials,
        test: { worker, loader: new FakeLoader(tutorials['01-welcome']) },
      };
      const containerDiv = document.getElementById('container');
      expect(containerDiv).not.toEqual(null);
      const container = new Container(containerDiv!, clientOpts);
      const install = await worker.next();
      expect(install.type).toEqual('INSTALL_PACKAGES')
      worker.onmessage!({ type: 'LOADED' });
      worker.onmessage!({ type: 'PACKAGES_INSTALLED' });
      // TODO: mock out editor and await container.readyToRun.promise;
    });
  });
});