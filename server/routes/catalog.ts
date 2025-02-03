import { fiolinSharedHeaders } from '../html';
import { versionedLink } from '../../utils/versioned-link';
import { dedent } from '../../common/indent';
import { renderCatalog } from '../../components/server/catalog';

export default defineEventHandler(async (event) => {
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>ƒɪᴏʟɪɴ</title>
        <script src="${versionedLink('/index.js')}" type="module" defer></script>
      </head>
      <body>
        ${await renderCatalog(4)}
      </body>
    </html>
  `);
});
