import { redent } from '../common/indent';
import { pkgPath } from '../utils/pkg-path';
import { marked } from 'marked';
import { readFileSync } from 'node:fs';
import { versionedLink } from '../utils/versioned-link';

export function fiolinSharedHeaders(): string {
  return redent(`
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="${versionedLink('/index.css')}">
    <link rel="stylesheet" href="${versionedLink('/bundle/host.css')}">
    <script src="${versionedLink('/bundle/host.js')}" type="module" defer></script>
  `, '        ');
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
