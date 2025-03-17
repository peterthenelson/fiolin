import { redent } from '../../common/indent';
import { FiolinScript } from '../../common/types';

export function renderTerminal(opts?: { script?: FiolinScript, numSpaces?: number }) {
  const hidden = opts?.script?.interface?.terminal == 'FATAL_ONLY' ? 'hidden' : '';
  return redent(`
    <div class="terminal ${hidden}" data-rel-id="terminal">
      <div class="terminal-controls hidden" data-rel-id="terminal-controls">
        <select class="terminal-mode" data-rel-id="terminal-mode">
          <option>FATAL_ONLY</option>
          <option>TEXT</option>
          <option>LOG</option>
        </select>
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
      <div class="terminal-contents" data-rel-id="terminal-contents">
        <div class="terminal-text" data-rel-id="terminal-text">Loading...</div>
        <div class="terminal-logs hidden" data-rel-id="terminal-logs"></div>
    </div>
  `, ' '.repeat(opts?.numSpaces || 0));
}