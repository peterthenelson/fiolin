import { redent } from '../common/indent';
import { pkgPath } from './pkg-path';
import { marked } from 'marked';
import { readFileSync } from 'node:fs';

export function fiolinSharedHeaders(): string {
  return redent(`
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/index.css">
    <link rel="stylesheet" href="/bundle/host.css">
    <script src="/bundle/host.js" type="module" defer></script>
  `, '    ');
}

export interface FiolinContainerOptions {
  // Title for the script (defaults to empty)
  title?: string;
  // Description for the script (defaults to Loading...)
  desc?: string;
  // Start in dev mode
  devModeOn?: boolean;
  // Prefix for any ids (if you want multiple of these in the same page).
  idPrefix?: string;
}

export function fiolinContainer(options?: FiolinContainerOptions): string {
  options = options || {};
  const idPrefix = options.idPrefix ? options.idPrefix + '-' : '';
  return redent(`
    <div id="${idPrefix}container" class="container" ${options.devModeOn ? 'class="dev-mode"': ''}>
      <div class="script-header">
        <div class="script-title" data-rel-id="script-title">${options.title || ''}</div>
        <div class="dev-mode-button button" data-rel-id="dev-mode-button" title="Developer Mode">✎</div>
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
        <script src="/doc.js" type="module" defer></script>
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
