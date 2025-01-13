import { FiolinLogLevel } from '../../common/types';
import { getByRelIdAs } from '../../web-utils/select-as';

export class Terminal {
  // TODO: Have actual styled rows instead of a single pre element; also add
  // controls to filter by type or whatnot.
  private readonly terminal: HTMLPreElement;
  private readonly logs: [FiolinLogLevel, string][];
  private fatalMsg?: string;

  constructor(container: HTMLElement) {
    this.terminal = getByRelIdAs(container, 'output-term', HTMLPreElement);
    this.logs = [];
  }

  clear() {
    this.terminal.textContent = '';
    this.logs.length = 0;
  }

  log(level: FiolinLogLevel, msg: string) {
    if (this.logs.length === 0) {
      this.terminal.textContent = '';
    }
    this.logs.push([level, msg]);
    this.terminal.textContent += level[0] + ': ' + msg + '\n';
    this.terminal.scroll({ top: this.terminal.scrollHeight, behavior: 'smooth' });
  }

  fatal(msg: string) {
    this.fatalMsg = msg;
    this.terminal.textContent = this.fatalMsg;
  }
}