import { indent, redent } from '../../common/indent';
import { FiolinScript } from '../../common/types';
import { loadSvg } from '../../utils/load-svg';
import { renderDeployDialog } from '../../components/server/deploy-dialog';
import { renderEditor } from '../../components/server/editor';
import { renderTerminal } from '../../components/server/terminal';
import { renderCustomForm } from '../../components/server/custom-form';
import { renderSimpleForm } from '../../components/server/simple-form';

function mkOptions(hashNamePairs: [string, string][], prefix: string): string {
  const opts = hashNamePairs.map(([p, n]) => `<option value="${p}">${n}</option>`);
  return indent(opts.join('\n'), prefix);
}

export interface FiolinContainerOptions {
  // Title for the script (defaults to empty)
  title?: string;
  // Description for the script (defaults to Loading...)
  desc?: string;
  // Run as script playground (dev mode always on, deploy button instead).
  playground?: boolean;
  // Tutorials, if any, for playground.
  tutorial?: Record<string, FiolinScript>;
  // Prefix for any ids (if you want multiple of these in the same page).
  idPrefix?: string;
  // Number of spaces to indent
  numSpaces?: number;
}

export function renderContainer(options?: FiolinContainerOptions): string {
  options = options || {};
  const idPrefix = options.idPrefix ? options.idPrefix + '-' : '';
  const dmHidden = options.playground ? 'hidden' : '';
  const depHidden = options.playground ? '' : 'hidden';
  const hashNamePairs: [string, string][] = (
    options.tutorial ?
    Object.entries(options.tutorial).map(([h, s]) => [h, s.meta.title]) :
    []);
  return redent(`
    <div id="${idPrefix}container" class="container ${options.playground ? 'dev-mode' : ''}">
      <div class="script-header flex-row-wrap">
        <div class="script-title" data-rel-id="script-title">${options.title || ''}</div>
        <select class="${options.tutorial ? '' : 'hidden'}" data-rel-id="tutorial-select" disabled>
          ${mkOptions(hashNamePairs, '          ')}
        </select>
        <div class="script-buttons">
          <div class="dev-mode-button circle-button button ${dmHidden}" data-rel-id="dev-mode-button" title="Developer Mode">
            ${loadSvg('dev')}
          </div>
          <div class="deploy-button circle-button button ${depHidden}" data-rel-id="deploy-button" title="Deploy To Github">
            ${loadSvg('deploy')}
          </div>
        </div>
        ${renderDeployDialog(8)}
      </div>
      <div class="script">
        <pre class="script-desc" data-rel-id="script-desc">${options.desc || 'Loading...'}</pre>
        <div class="mobile-warning">Developer Mode has limited support on mobile</div>
        ${renderEditor(8)}
      </div>
      <div class="script-controls">
        ${renderCustomForm(8)}
        ${renderSimpleForm(8)}
      </div>
      <div class="script-output">
        ${renderTerminal(8)}
      </div>
      <div class="flow-row-wrap footer">
        <a href="/">Return Home</a>
        <span>&nbsp;</span>
        <a href="https://github.com/peterthenelson/fiolin/issues/new">Report Bug</a>
      </div>
    </div>
  `, ' '.repeat(options.numSpaces || 0));
}