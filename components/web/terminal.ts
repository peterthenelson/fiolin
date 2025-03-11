import { FiolinLogLevel } from '../../common/types';
import { getByRelIdAs } from '../../web-utils/select-as';

interface RenderedLog {
  level: FiolinLogLevel;
  msg: string;
  div: HTMLDivElement;
}

interface RenderedTerminalText {
  text: string;
  err: boolean;
  span: HTMLSpanElement;
}

interface RenderedFatal {
  text: string;
  div: HTMLDivElement;
}

export class Terminal {
  // TODO: Add controls to filter by type or whatnot.
  private readonly terminal: HTMLDivElement;
  private readonly text: HTMLDivElement;
  private readonly logs: RenderedLog[];
  private readonly terminalText: RenderedTerminalText[];
  private fatalMsg?: RenderedFatal;

  constructor(container: HTMLElement) {
    this.terminal = getByRelIdAs(container, 'terminal', HTMLDivElement);
    this.text = getByRelIdAs(this.terminal, 'terminal-text', HTMLDivElement);
    this.logs = [];
    this.terminalText = [];
  }

  clear() {
    this.logs.length = 0;
    this.terminalText.length = 0;
    this.fatalMsg = undefined;
    this.updateUi();
  }

  log(level: FiolinLogLevel, msg: string) {
    // Update logs
    const div = document.createElement('div');
    const levelDiv = document.createElement('div');
    levelDiv.textContent = level;
    levelDiv.classList.add('log-level');
    const msgDiv = document.createElement('div');
    msgDiv.textContent = msg;
    div.replaceChildren(levelDiv, msgDiv);
    this.logs.push({level, msg, div});
    div.classList.add(this.logs.length % 2 == 0 ? 'log-even' : 'log-odd');
    // Update terminalText
    if (level === 'INFO' || level === 'ERROR') {
      const span = document.createElement('span');
      span.textContent = msg;
      let err = false;
      if (level === 'ERROR') {
        span.classList.add('terminal-stderr');
        err = true;
      }
      this.terminalText.push({ text: msg, err, span });
    }
    this.updateUi();
  }

  fatal(msg: string) {
    const div = document.createElement('div');
    div.textContent = msg;
    this.fatalMsg = { text: msg, div }
    this.updateUi();
  }

  private updateUi() {
    if (this.fatalMsg !== undefined) {
      this.text.replaceChildren(this.fatalMsg.div);
      this.terminal.replaceChildren(this.text);
    } else if (this.logs.length === 0) {
      this.text.replaceChildren();
      this.text.textContent = '';
      this.terminal.replaceChildren(this.text);
    } else {
      const divs: Node[] = [];
      for (const rl of this.logs) {
        divs.push(rl.div);
        rl.div.style.width = `${this.terminal.scrollWidth}px`;
      }
      this.terminal.replaceChildren(...divs);
    }
    this.terminal.scroll({ top: this.terminal.scrollHeight, behavior: 'smooth' });
  }
}