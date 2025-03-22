import { parseAs } from '../common/parse';
import { pWorkerMessage } from './parse-msg';
import { WorkerMessage } from './types';

export interface ITypedWorker {
  onmessage: ((msg: WorkerMessage) => void) | null;
  onerror: ((ev: ErrorEvent) => void) | null;
  postMessage(msg: WorkerMessage, transfer?: Transferable[]): void;
}

export class TypedWorker {
  private readonly worker: Worker;
  public onmessage: ((msg: WorkerMessage) => void) | null;
  public onerror: ((ev: ErrorEvent) => void) | null;

  constructor(scriptURL: string | URL, options?: WorkerOptions) {
    this.worker = new Worker(scriptURL, options);
    this.onmessage = null;
    this.worker.onmessage = (ev) => {
      if (this.onmessage) {
        this.onmessage(parseAs(pWorkerMessage, ev.data));
      }
    }
    this.onerror = null;
    this.worker.onerror = (ev) => {
      if (this.onerror) {
        this.onerror(ev);
      }
    }
  }

  postMessage(msg: WorkerMessage, transfer?: Transferable[]) {
    this.worker.postMessage(msg, transfer || []);
  }
}
