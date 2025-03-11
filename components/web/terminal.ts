import { FiolinLogLevel, FiolinScript, TerminalMode } from '../../common/types';
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
  // TODO: Add controls to manually change mode or to filter by type in log mode 
  private readonly terminal: HTMLDivElement;
  private readonly text: HTMLDivElement;
  private readonly logs: RenderedLog[];
  private readonly terminalText: RenderedTerminalText[];
  private fatalMsg?: RenderedFatal;
  private mode: TerminalMode;

  constructor(container: HTMLElement) {
    this.terminal = getByRelIdAs(container, 'terminal', HTMLDivElement);
    this.text = getByRelIdAs(this.terminal, 'terminal-text', HTMLDivElement);
    this.logs = [];
    this.terminalText = [];
    this.mode = 'TEXT';
  }

  onLoad(script: FiolinScript) {
    this.mode = script.interface.terminal || 'TEXT';
    this.updateUi();
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
      span.textContent = msg + '\n';
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
      this.terminal.classList.remove('hidden');
    } else if (this.mode === 'FATAL_ONLY') {
      this.terminal.classList.add('hidden');
    } else if (this.mode === 'TEXT') {
      const spans: Node[] = this.terminalText.map((rt) => rt.span);
      this.text.textContent = '';
      this.text.replaceChildren(...spans);
      this.terminal.replaceChildren(this.text);
      this.terminal.classList.remove('hidden');
    } else if (this.mode === 'LOG') {
      const divs: Node[] = [];
      for (const rl of this.logs) {
        divs.push(rl.div);
        rl.div.style.width = `${this.terminal.scrollWidth}px`;
      }
      this.terminal.replaceChildren(...divs);
      this.terminal.classList.remove('hidden');
    } else {
      this.text.replaceChildren();
      this.text.textContent = '';
      this.terminal.replaceChildren(this.text);
    }
    this.terminal.scroll({ top: this.terminal.scrollHeight, behavior: 'smooth' });
  }
}