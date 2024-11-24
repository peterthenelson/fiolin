import { loadAll } from '../../utils/config';
import { fiolinSharedHeaders, versionedLink } from '../../utils/html';
import { indent, dedent } from '../../common/indent';

function mkLis(pathNamePairs: [string, string][], prefix: string): string {
  const lis = pathNamePairs.map(([p, n]) => `<li><a href="${p}">${n}</a></li>`);
  return indent(lis.join('\n'), prefix);
}

export default defineEventHandler(async (event) => {
  const scripts = await loadAll();
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>ƒɪᴏʟɪɴ</title>
        <script src="${versionedLink('/index.js')}" type="module" defer></script>
      </head>
      <body>
        <div class="container">
          <h1>ƒɪᴏʟɪɴ</h1>
          <div class="home-subtitle">Your files belong to you.</div>
          <div class="home-text">
            Easily convert between file formats, combine PDFs, and more.
            Unlike other websites, your files stay on your computer!
          </div>
          <ul>
            ${mkLis(Object.keys(scripts).map(s => [`/s/${s}`, s]), '            ')}
          </ul>
          <div class="home-footer home-text">
            Are you a software developer? Write and share your own fiolin
            scripts. Get started with the <a href="/playground/">tutorial</a> or
            <a href="/doc">read the docs</a>.
          </div>
        </div>
      </body>
    </html>
  `);
});
