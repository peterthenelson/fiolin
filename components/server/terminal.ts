import { redent } from '../../common/indent';

export function renderTerminal(numSpaces?: number) {
  return redent(`
    <div class="terminal" data-rel-id="terminal">
      <div class="terminal-text" data-rel-id="terminal-text">Loading...</div>
      <div class="terminal-log-filter" data-rel-id="terminal-log-filter">
        <label>
          <input type="checkbox" value="DEBUG" checked />
          <span>DEBUG</span>
        </label>
        <label>
          <input type="checkbox" value="INFO" checked />
          <span>INFO</span>
        </label>
        <label>
          <input type="checkbox" value="WARN" checked />
          <span>WARN</span>
        </label>
        <label>
          <input type="checkbox" value="ERROR" checked />
          <span>ERROR</span>
        </label>
      </div>
    </div>
  `, ' '.repeat(numSpaces || 0));
}