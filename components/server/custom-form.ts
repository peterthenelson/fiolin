import { redent } from '../../common/indent';
import { FiolinScript } from '../../common/types';

// TODO: Do some kind of pre-rendering of an intert form tag for jank reasons
export function renderCustomForm(opts?: { script?: FiolinScript, numSpaces?: number }) {
  return redent(`
    <form class="script-form" data-rel-id="script-form"></form>
  `, ' '.repeat(opts?.numSpaces || 0));
}