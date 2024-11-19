import { loadAll } from '../../utils/config';
import { fiolinSharedHeaders } from '../../utils/html';
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
        <script src="/index.js" type="module" defer></script>
      </head>
      <body>
        <div class="container">
          <h3>First-Party ƒɪᴏʟɪɴ Scripts</h3>
          <ul>
            ${mkLis(Object.keys(scripts).map(s => [`/s/${s}`, s]), '            ')}
          </ul>
          <h3>Run A Third-Party Script:</h3>
          <a href="/third-party" class="hidden">third-party script page</a>
          <form id="form-3p" action="/third-party/" method="GET">
            <label for="gh">Github user/repo/path-to-fiolin.json</label>
            <input type="text" id="gh" name="gh">
            <label for="url">Alternately, fully specify a URL:</label>
            <input type="text" id="url" name="url">
            <button type="submit">Submit</button>
          </form>
          <h3><a href="/doc/">Read The Documentation</a></h3>
          <h3><a href="/playground/">Create A Script In The Playground</a></h3>
        </div>
      </body>
    </html>
  `);
});
