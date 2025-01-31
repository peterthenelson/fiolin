import { redent } from '../../common/indent';

export function renderTerminal(numSpaces?: number) {
  return redent(`
    <div class="terminal" data-rel-id="terminal">
      <div class="terminal-single-msg" data-rel-id="terminal-single-msg">Loading...</div>
    </div>
  `, ' '.repeat(numSpaces || 0));
}