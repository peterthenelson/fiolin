import { indent, redent } from '../../common/indent';
import { FiolinScript } from '../../common/types';

function mkOptions(hashNamePairs: [string, string][], prefix: string): string {
  const opts = hashNamePairs.map(([p, n]) => `<option value="${p}">${n}</option>`);
  return indent(opts.join('\n'), prefix);
}

export interface TutorialOptions {
  tutorials?: Record<string, FiolinScript>;
  numSpaces?: number;
}

export function renderTutorialLoader(opts?: TutorialOptions) {
  opts = opts || {};
  const hashNamePairs: [string, string][] = (
    opts.tutorials ?
    Object.entries(opts.tutorials).map(([h, s]) => [h, s.meta.title]) :
    []);
  return redent(`
    <select class="${opts.tutorials ? '' : 'hidden'}" data-rel-id="tutorial-select" disabled>
        ${mkOptions(hashNamePairs, ' '.repeat((opts.numSpaces || 0) + 2))}
    </select>
  `, ' '.repeat(opts.numSpaces || 0));
}