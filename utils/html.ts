import { indent, redent } from '../common/indent';
import { pkgPath } from './pkg-path';
import { marked } from 'marked';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { FiolinScript } from '../common/types';

// Covert x.js or /x.js to /x.js?v=123, supposing that the contents of the file
// PKG_ROOT/server/public/x.js has a hash of 123. Alternately, the contents to
// be hashed are directly specified.
export function versionedLink(path: string, contents?: string): string {
  if (path.at(0) === '/') {
    path = path.substring(1);
  }
  // The hash method is arbitrarily chosen, but it's not crazily long and it's
  // unlikely to collide.
  let hash: string = '';
  if (contents) {
    hash = createHash('shake256', { outputLength: 6 }).update(contents).digest('base64url');
  } else {
    const buf = readFileSync(pkgPath(`server/public/${path}`));
    hash = createHash('shake256', { outputLength: 6 }).update(buf).digest('base64url');
  }
  return `/${path}?v=${hash}`;
}

function loadSvg(name: string): string {
  return indent(
    readFileSync(pkgPath(`server/public/${name}.svg`), { encoding: 'utf-8' }),
    '          ');
}

export function fiolinSharedHeaders(): string {
  return redent(`
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="${versionedLink('/index.css')}">
    <link rel="stylesheet" href="${versionedLink('/bundle/host.css')}">
    <script src="${versionedLink('/bundle/host.js')}" type="module" defer></script>
  `, '        ');
}

function deployDialog(): string {
  return redent(`
    <dialog data-rel-id="deploy-dialog">
      <form method="dialog" class="flex-col-wrap" data-rel-id="deploy-form">
        <div class="flex-row-wrap">
          <div class="deploy-readme">
            This shell script will create or update a github repository and
            publish it on github.io.  It requires the
            <a href="https://cli.github.com">github cli</a> to be installed.
            If you prefer, you can copy the
            <a href="https://github.com/peterthenelson/fiolin-template">template
            repo</a> and follow the documentation there to develop and deploy
            fiolin scripts.
          </div>
        </div>
        <div class="flex-row-wrap">
          <label>
            Script id (lowercase, no spaces)
            <input
              type="text" name="script-id" data-rel-id="script-id"
              pattern="^[a-z0-9_\\-]+$" placeholder="script-id"
              required autofocus
            />
          </label>
        </div>
        <div class="flex-row-wrap">
          <label>
            Github username
            <input
              type="text" name="gh-user-name"
              placeholder="github-user" required
            />
          </label>
          <label>
            Github repository
            <input
              type="text" name="gh-repo-name"
              placeholder="github-repo" required
            />
          </label>
        </div>
        <div class="flex-row-wrap">
          <label>
            Default Branch
            <input
              type="text" name="gh-default-branch"
              placeholder="github-default-branch" value="main" required
            />
          </label>
          <label>
            Github Pages Branch
            <input
              type="text" name="gh-pages-branch"
              placeholder="github-pages-branch" value="gh-pages" required
            />
          </label>
        </div>
        <div class="flex-row-wrap">
          <label>
            Shell language
            <select name="lang" required>
              <option value="SH">
                Bash file (Mac, Linux)
              </option>
              <option value="BAT">
                Batch file (Windows)
              </option>
            </select>
          </label>
        </div>
        <div class="flex-row-wrap">
          <button type="submit">Deploy Script</button>
          <button value="cancel" formnovalidate>Cancel</button>
        </div>
      </form>
    </dialog>
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

// TODO: Add tutorial selector
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
          <div class="dev-mode-button button ${dmHidden}" data-rel-id="dev-mode-button" title="Developer Mode">
            ${loadSvg('dev')}
          </div>
          <div class="deploy-button button ${depHidden}" data-rel-id="deploy-button" title="Deploy To Github">
            ${loadSvg('deploy')}
          </div>
        </div>
        ${deployDialog()}
      </div>
      <div class="script">
        <pre class="script-desc" data-rel-id="script-desc">${options.desc || 'Loading...'}</pre>
        <div class="mobile-warning">Developer Mode has limited support on mobile</div>
        <div class="script-editor" data-rel-id="script-editor"></div>
      </div>
      <div class="script-controls">
        <label for="${idPrefix}input-files-chooser" class="files-label">
          <div class="files-panel button">
            <p class="files-panel-text" data-rel-id="files-panel-text">Choose An Input File</p>
          </div>
          <input type="file" id="${idPrefix}input-files-chooser" data-rel-id="input-files-chooser" disabled />
        </label>
        <!-- TODO -->
      </div>
      <div class="script-output">
        <pre class="output-term" data-rel-id="output-term">Loading...</pre>
      </div>
    </div>
  `, '    ');
}

export function mdDoc(path: string) {
  // Note: the dev server is just used for pre-rendering; we do not actually
  // have to care about path traversal vulnerabilities.
  const md: string = readFileSync(pkgPath(`docs/${path}.md`), { encoding: 'utf-8' });
  const parsed: string = marked.parse(md, { async: false });
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
