import { parseAs } from "../common/parse";
import { pWorkerMessage } from "../web-utils/parse-msg";
import { WorkerMessage } from "../web-utils/types";

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

  postMessage(msg: WorkerMessage) {
    this.worker.postMessage(msg);
  }
}
