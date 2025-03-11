import { redent } from '../../common/indent';

export function renderTerminal(numSpaces?: number) {
  return redent(`
    <div class="terminal" data-rel-id="terminal">
      <div class="terminal-text" data-rel-id="terminal-text">Loading...</div>
    </div>
  `, ' '.repeat(numSpaces || 0));
}