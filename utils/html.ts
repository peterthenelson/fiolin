import { indent, redent } from '../common/indent';
import { pkgPath } from './pkg-path';
import { marked } from 'marked';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Covert x.js or /x.js to /x.js?v=123, supposing that the contents of the file
// PKG_ROOT/server/public/x.js has a hash of 123.
export function versionedLink(publicRelativePath: string): string {
  if (publicRelativePath.at(0) === '/') {
    publicRelativePath = publicRelativePath.substring(1);
  }
  const buf = readFileSync(pkgPath(`server/public/${publicRelativePath}`));
  // Arbitrarily chosen, but it's not crazily long and it's unlikely to collide
  const hash = createHash('shake256', { outputLength: 6 }).update(buf).digest('base64url');
  return `/${publicRelativePath}?v=${hash}`;
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
            This shell script will create or update a github repository, add
            files for the current script, and publish a compiled verion to
            github.io. If you prefer, you can copy the
            <a href="https://github.com/peterthenelson/fiolin-template">template
            repo</a> and follow the documentation there to develop and deploy
            fiolin scripts.
          </div>
        </div>
        <div class="flex-row-wrap">
          <label>
            Github username
            <input
              type="text" name="gh-user-name" autofocus
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
            Script id (lowercase, no spaces)
            <input
              type="text" name="script-id" data-rel-id="script-id"
              pattern="^[a-z0-9_\\-]+$" placeholder="script-id" required
            />
          </label>
        </div>
        <div class="flex-row-wrap">
          <label>
            Shell language
            <select name="lang" required>
              <option value="SH" data-rel-id="sh-lang">
                Bash file (Mac, Linux)
              </option>
              <option value="BAT" data-rel-id="sh-lang">
                Batch file (Windows)
              </option>
            </select>
          </label>
        </div>
        <div class="flex-row-wrap">
          <div class="button" data-rel-id="deploy-ok">Deploy Script</div>
          <div class="button" data-rel-id="deploy-cancel">Cancel</div>
        </div>
      </form>
    </dialog>
  `, '        ');
}

export interface FiolinContainerOptions {
  // Title for the script (defaults to empty)
  title?: string;
  // Description for the script (defaults to Loading...)
  desc?: string;
  // Run as script playground (dev mode always on, deploy button instead).
  playground?: boolean;
  // Prefix for any ids (if you want multiple of these in the same page).
  idPrefix?: string;
}

export function fiolinContainer(options?: FiolinContainerOptions): string {
  options = options || {};
  const idPrefix = options.idPrefix ? options.idPrefix + '-' : '';
  const dmHidden = options.playground ? 'hidden' : '';
  const depHidden = options.playground ? '' : 'hidden';
  return redent(`
    <div id="${idPrefix}container" class="container ${options.playground ? 'dev-mode' : ''}">
      <div class="script-header">
        <div class="script-title" data-rel-id="script-title">${options.title || ''}</div>
        <div class="dev-mode-button button ${dmHidden}" data-rel-id="dev-mode-button" title="Developer Mode">
          ${loadSvg('dev')}
        </div>
        <div class="deploy-button button ${depHidden}" data-rel-id="deploy-button" title="Deploy To Github">
          ${loadSvg('deploy')}
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
