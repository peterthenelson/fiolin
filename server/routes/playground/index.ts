import { dedent } from '../../../common/indent';
import { fiolinContainer, fiolinSharedHeaders } from '../../../utils/html';

export default defineEventHandler(() => {
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>ƒɪᴏʟɪɴ playground</title>
        ${fiolinSharedHeaders()}
        <script src="/playground.js" type="module" defer></script>
      </head>
      <body>
        ${fiolinContainer({ editorOpen: true })}
      </body>
    </html>
  `);
});
