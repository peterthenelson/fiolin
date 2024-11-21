import { dedent } from '../../../common/indent';
import { fiolinContainer, fiolinSharedHeaders, versionedLink } from '../../../utils/html';

export default defineEventHandler(() => {
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>ƒɪᴏʟɪɴ playground</title>
        <script src="${versionedLink('/playground.js')}" type="module" defer></script>
      </head>
      <body>
        ${fiolinContainer({ playground: true })}
      </body>
    </html>
  `);
});
