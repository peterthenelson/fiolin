import { dedent } from '../../../common/indent';
import { fiolinSharedHeaders } from '../../html';
import { versionedLink } from '../../../utils/versioned-link';
import { renderContainer } from '../../../components/server/container';

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
        ${renderContainer({ mode: '3P', numSpaces: 4 })}
      </body>
    </html>
  `);
});
