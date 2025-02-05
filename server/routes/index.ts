import { loadAll } from '../../utils/config';
import { fiolinSharedHeaders } from '../html';
import { versionedLink } from '../../utils/versioned-link';
import { dedent } from '../../common/indent';
import { generateSuggestions, renderAutocomplete } from '../../components/server/autocomplete';

export default defineEventHandler(async (event) => {
  const scripts = await loadAll();
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>ƒɪᴏʟɪɴ</title>
        <script src="${versionedLink('/load-suggestions', JSON.stringify(generateSuggestions(scripts)))}" type="module" defer></script>
        <script src="${versionedLink('/index.js')}&suggestionsVar=suggestions" type="module" defer></script>
      </head>
      <body>
        <div class="container">
          <a href="/" class="plain-link"><h1>ƒ<span class="home-io">ɪᴏ</span>ʟɪɴ</h1></a>
          <div class="home-subtitle">Your files belong to you.</div>
          <div class="home-text">
            Easily convert between file formats, combine PDFs, and more.
            Unlike other websites, your files stay on your computer!
          </div>
          <div class="search flex-col-wrap">
            ${renderAutocomplete(8)}
            <a href="/catalog" class="browse">Or Browse The Catalog</a>
          </div>
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
