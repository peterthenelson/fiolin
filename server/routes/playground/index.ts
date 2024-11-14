import { dedent } from '../../../common/indent';
import { fiolinContainer, fiolinSharedHeaders } from '../../../utils/html';

export default defineEventHandler(() => {
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>ƒɪᴏʟɪɴ playground</title>
        <script src="/playground.js" type="module" defer></script>
      </head>
      <body>
        ${fiolinContainer({ devModeOn: true })}
      </body>
    </html>
  `);
});
