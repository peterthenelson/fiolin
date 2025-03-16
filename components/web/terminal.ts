import { FiolinLogLevel, FiolinScript, TerminalMode } from '../../common/types';
import { getByRelIdAs, selectAllAs, selectAs } from '../../web-utils/select-as';
import { setSelected } from '../../web-utils/set-selected';

interface RenderedMode {
  select: HTMLSelectElement;
  mode: TerminalMode;
}

interface RenderedLogFilter {
  div: HTMLDivElement;
  active: Record<FiolinLogLevel, boolean>;
}

interface RenderedText {
  fatal?: string;
  div: HTMLDivElement;
  entries: RenderedTextSpan[];
}

interface RenderedTextSpan {
  text: string;
  err: boolean;
  span: HTMLSpanElement;
}

interface RenderedLog {
  div: HTMLDivElement;
  entries: RenderedLogDiv[];
}

interface RenderedLogDiv {
  level: FiolinLogLevel;
  msg: string;
  div: HTMLDivElement;
}

export class Terminal {
  private readonly terminal: HTMLDivElement;
  private readonly controls: HTMLDivElement;
  private mode: RenderedMode;
  private readonly logFilter: RenderedLogFilter;
  private readonly text: RenderedText;
  private readonly logs: RenderedLog;

  constructor(container: HTMLElement) {
    this.terminal = getByRelIdAs(container, 'terminal', HTMLDivElement);
    this.controls = getByRelIdAs(this.terminal, 'terminal-controls', HTMLDivElement);
    const contents = getByRelIdAs(this.terminal, 'terminal-contents', HTMLDivElement);
    this.mode = {
      select: getByRelIdAs(this.controls, 'terminal-mode', HTMLSelectElement),
      mode: 'TEXT',
    };
    this.logFilter = {
      div: getByRelIdAs(this.controls, 'terminal-log-filter', HTMLDivElement),
      active: { DEBUG: true, INFO: true, WARN: true, ERROR: true },
    };
    this.text = {
      div: getByRelIdAs(contents, 'terminal-text', HTMLDivElement),
      entries: [],
    };
    this.logs = {
      div: getByRelIdAs(contents, 'terminal-logs', HTMLDivElement),
      entries: [],
    };
    this.setUpHandlers();
  }

  private setUpHandlers() {
    this.mode.select.oninput = (e) => {
      this.mode.mode = this.mode.select.value as TerminalMode;
      this.updateUi({});
    }
    const checkboxes = selectAllAs(this.logFilter.div, 'input[type="checkbox"]', HTMLInputElement);
    for (const c of checkboxes) {
      c.oninput = (e) => {
        const t = e.currentTarget;
        if (!(t instanceof HTMLInputElement)) {
          throw new Error(`Expected target to be <input>, got ${t}`);
        }
        this.logFilter.active[t.value as FiolinLogLevel] = t.checked;
        this.updateUi({});
      };
    }
  }

  onLoad(script: FiolinScript) {
    this.mode.mode = script.interface.terminal || 'TEXT';
    setSelected(this.mode.select, this.mode.mode);
    this.updateUi({ scroll: true });
  }

  clear() {
    this.logs.entries.length = 0;
    this.text.fatal = undefined;
    this.text.entries.length = 0;
    this.updateUi({ scroll: true });
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
    this.logs.entries.push({level, msg, div});
    // Update terminalText
    if (level === 'INFO' || level === 'ERROR') {
      const span = document.createElement('span');
      span.textContent = msg + '\n';
      let err = false;
      if (level === 'ERROR') {
        span.classList.add('terminal-stderr');
        err = true;
      }
      this.text.entries.push({ text: msg, err, span });
    }
    this.updateUi({ scroll: true });
  }

  fatal(msg: string) {
    this.text.fatal = msg;
    this.updateUi({ scroll: true, forceFatal: true });
  }

  private setVisibility(opts: { forceFatal?: boolean }) {
    this.terminal.classList.remove('hidden');
    if (this.mode.mode == 'FATAL_ONLY' && !opts.forceFatal && this.text.fatal == undefined) {
      this.terminal.classList.add('hidden');
    }
    this.controls.classList.add('hidden');
    this.logFilter.div.classList.add('hidden');
    this.text.div.classList.add('hidden');
    this.logs.div.classList.add('hidden');
    if (this.text.fatal !== undefined || this.mode.mode == 'TEXT') {
      this.text.div.classList.remove('hidden');
    } else if (this.mode.mode == 'LOG') {
      this.logFilter.div.classList.remove('hidden');
      this.logs.div.classList.remove('hidden');
    }
  }

  private updateUi(opts: { scroll?: boolean, forceFatal?: boolean }) {
    if (opts.forceFatal || this.mode.mode === 'FATAL_ONLY') {
      this.text.div.replaceChildren();
      this.text.div.textContent = this.text.fatal || '';
    } else if (this.mode.mode === 'TEXT') {
      const spans: Node[] = this.text.entries.map((rt) => rt.span);
      this.text.div.textContent = '';
      this.text.div.replaceChildren(...spans);
    } else if (this.mode.mode === 'LOG') {
      const divs: Node[] = [];
      for (let i = 0; i < this.logs.entries.length; i++) {
        const rl = this.logs.entries[i];
        if (this.logFilter.active[rl.level]) {
          rl.div.classList.remove('log-even');
          rl.div.classList.remove('log-odd');
          rl.div.classList.add(i % 2 == 1 ? 'log-even' : 'log-odd');
          rl.div.style.width = `${this.terminal.scrollWidth}px`;
          divs.push(rl.div);
        }
      }
      this.logs.div.replaceChildren(...divs);
    }
    this.setVisibility(opts);
    if (opts.scroll) {
      this.terminal.scroll({ top: this.terminal.scrollHeight, behavior: 'smooth' });
    }
  }
}