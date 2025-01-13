import { redent } from '../../common/indent';

export function renderTerminal(numSpaces?: number) {
  return redent(`
    <pre class="output-term" data-rel-id="output-term">Loading...</pre>
  `, ' '.repeat(numSpaces || 0));
}