import { dedent } from '../../../common/indent';
import { fiolinContainer, fiolinSharedHeaders, versionedLink } from '../../../utils/html';

export default defineEventHandler(() => {
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>ƒɪᴏʟɪɴ: 3rd party script</title>
        <script src="${versionedLink('/third-party.js')}" type="module" defer></script>
      </head>
      <body>
        <!-- TODO: Third-party-specific components -->
        ${fiolinContainer()}
      </body>
    </html>
  `);
});
