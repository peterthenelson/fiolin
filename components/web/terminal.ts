import { FiolinLogLevel } from '../../common/types';
import { getByRelIdAs } from '../../web-utils/select-as';

interface RenderedLog {
  level: FiolinLogLevel;
  msg: string;
  div: HTMLDivElement;
}

export class Terminal {
  // TODO: Have actual styled rows instead of a single pre element; also add
  // controls to filter by type or whatnot.
  private readonly terminal: HTMLDivElement;
  private readonly singleMsg: HTMLDivElement;
  private readonly logs: RenderedLog[];
  private fatalMsg?: string;

  constructor(container: HTMLElement) {
    this.terminal = getByRelIdAs(container, 'terminal', HTMLDivElement);
    this.singleMsg = getByRelIdAs(this.terminal, 'terminal-single-msg', HTMLDivElement);
    this.logs = [];
  }

  clear() {
    this.terminal.replaceChildren(this.singleMsg);
    this.singleMsg.textContent = '';
    this.logs.length = 0;
  }

  log(level: FiolinLogLevel, msg: string) {
    if (this.logs.length === 0) {
      this.terminal.textContent = '';
    }
    const div = document.createElement('div');
    const levelSpan = document.createElement('div');
    levelSpan.textContent = level;
    levelSpan.classList.add('log-level');
    const msgSpan = document.createElement('div');
    msgSpan.textContent = msg;
    div.replaceChildren(levelSpan, msgSpan);
    this.logs.push({level, msg, div});
    div.classList.add(this.logs.length % 2 == 0 ? 'log-even' : 'log-odd');
    this.terminal.appendChild(div);
    this.logs.forEach((rl) => { rl.div.style.width = `${this.terminal.scrollWidth}px` });
    this.terminal.scroll({ top: this.terminal.scrollHeight, behavior: 'smooth' });
  }

  fatal(msg: string) {
    this.fatalMsg = msg;
    this.terminal.replaceChildren(this.singleMsg);
    this.singleMsg.textContent = this.fatalMsg;
  }
}