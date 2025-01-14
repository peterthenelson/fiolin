import { redent } from '../../common/indent';
import { FiolinScript } from '../../common/types';
import { loadSvg } from '../../utils/load-svg';
import { renderDeployDialog } from '../../components/server/deploy-dialog';
import { renderEditor } from '../../components/server/editor';
import { renderTerminal } from '../../components/server/terminal';
import { renderCustomForm } from '../../components/server/custom-form';
import { renderSimpleForm } from '../../components/server/simple-form';
import { renderTutorialLoader } from './tutorial-loader';

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

export function renderContainer(opts?: FiolinContainerOptions): string {
  opts = opts || {};
  const idPrefix = opts.idPrefix ? opts.idPrefix + '-' : '';
  const dmHidden = opts.playground ? 'hidden' : '';
  const depHidden = opts.playground ? '' : 'hidden';
  return redent(`
    <div id="${idPrefix}container" class="container ${opts.playground ? 'dev-mode' : ''}">
      <div class="script-header flex-row-wrap">
        <div class="script-title" data-rel-id="script-title">${opts.title || ''}</div>
        ${renderTutorialLoader({ tutorials: opts.tutorial, numSpaces: (opts.numSpaces || 0) + 4 })}
        <div class="script-buttons">
          <div class="dev-mode-button circle-button button ${dmHidden}" data-rel-id="dev-mode-button" title="Developer Mode">
            ${loadSvg('dev')}
          </div>
          <div class="deploy-button circle-button button ${depHidden}" data-rel-id="deploy-button" title="Deploy To Github">
            ${loadSvg('deploy')}
          </div>
        </div>
        ${renderDeployDialog((opts.numSpaces || 0) + 4)}
      </div>
      <div class="script">
        <pre class="script-desc" data-rel-id="script-desc">${opts.desc || 'Loading...'}</pre>
        <div class="mobile-warning">Developer Mode has limited support on mobile</div>
        ${renderEditor((opts.numSpaces || 0) + 4)}
      </div>
      <div class="script-controls">
        ${renderCustomForm((opts.numSpaces || 0) + 4)}
        ${renderSimpleForm((opts.numSpaces || 0) + 4)}
      </div>
      <div class="script-output">
        ${renderTerminal((opts.numSpaces || 0) + 4)}
      </div>
      <div class="flow-row-wrap footer">
        <a href="/">Return Home</a>
        <span>&nbsp;</span>
        <a href="https://github.com/peterthenelson/fiolin/issues/new">Report Bug</a>
      </div>
    </div>
  `, ' '.repeat(opts.numSpaces || 0));
}