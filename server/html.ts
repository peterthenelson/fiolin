import { indent, redent } from '../common/indent';
import { pkgPath } from '../utils/pkg-path';
import { marked } from 'marked';
import { readFileSync } from 'node:fs';
import { FiolinScript } from '../common/types';
import { versionedLink } from '../utils/versioned-link';
import { loadSvg } from '../utils/load-svg';
import { renderDeployDialog } from '../components/server/deploy-dialog';
import { renderEditor } from '../components/server/editor';

export function fiolinSharedHeaders(): string {
  return redent(`
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="${versionedLink('/index.css')}">
    <link rel="stylesheet" href="${versionedLink('/bundle/host.css')}">
    <script src="${versionedLink('/bundle/host.js')}" type="module" defer></script>
  `, '        ');
}

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
}

export function fiolinContainer(options?: FiolinContainerOptions): string {
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
        <form class="script-form" data-rel-id="script-form"></form>
        <label class="files-label">
          <div class="files-panel button flex-row-wrap">
            <span class="files-panel-text input-files-text" data-rel-id="input-files-text"></span>
            <div class="circle-button button" data-rel-id="run-button" title="Run Script">
              ${loadSvg('run')}
            </div>
            <span class="files-panel-text output-files-text" data-rel-id="output-files-text"></span>
          </div>
          <input type="file" data-rel-id="input-files-chooser" disabled />
        </label>
        <!-- TODO -->
      </div>
      <div class="script-output">
        <pre class="output-term" data-rel-id="output-term">Loading...</pre>
      </div>
      <div class="flow-row-wrap footer">
        <a href="/">Return Home</a>
        <span>&nbsp;</span>
        <a href="https://github.com/peterthenelson/fiolin/issues/new">Report Bug</a>
      </div>
    </div>
  `, '    ');
}

export function mdDoc(path: string) {
  // Note: the dev server is just used for pre-rendering; we do not actually
  // have to care about path traversal vulnerabilities.
  const md: string = readFileSync(pkgPath(`docs/${path}.md`), { encoding: 'utf-8' });
  // Rewrite local doc crosslinks
  const linkRewriter = new marked.Renderer();
  linkRewriter.link = ({href, title, text}): string => {
    const regex = /\.\/(.*)\.md/;
    if (regex.test(href)) {
      href = href.replace(regex, '/doc/$1');
    }
    return `<a href="${href}" title="${title || ''}">${text}</a>`;
  };
  const parsed: string = marked.parse(md, { async: false, renderer: linkRewriter });
  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>ƒɪᴏʟɪɴ documentation</title>
        <script src="${versionedLink('/doc.js')}" type="module" defer></script>
      </head>
      <body>
        <div class="container">
          <div class="doc">
            ${parsed}
          </div>
        </div>
      </body>
    </html>
  `;
};
