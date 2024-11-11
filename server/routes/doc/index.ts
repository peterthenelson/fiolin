import { dedent, indent } from '../../../common/indent';
import { pkgPath } from '../../../utils/pkg-path';
import { marked } from 'marked';
import { readFileSync } from 'node:fs';

export default defineEventHandler((event) => {
  const indexMd: string = readFileSync(pkgPath('docs/index.md'), { encoding: 'utf-8' });
  const parsed: string = marked.parse(indexMd, { async: false });
  // TODO: Match any path under docs, rather that just hardcoding index.
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>ƒɪᴏʟɪɴ</title>
        <link rel="stylesheet" href="/index.css">
      </head>
      <body>
        <div id="container">
          <div id="doc">
            ${indent(parsed, '            ')}
          </div>
        </div>
      </body>
    </html>
  `);
});
