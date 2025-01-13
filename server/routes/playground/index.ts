import { loadAllTutorials } from '../../../utils/config';
import { dedent } from '../../../common/indent';
import { fiolinContainer, fiolinSharedHeaders } from '../../html';
import { versionedLink } from '../../../utils/versioned-link';

export default defineEventHandler(async () => {
  const tutorial = await loadAllTutorials();
  const contents = JSON.stringify(tutorial);
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>ƒɪᴏʟɪɴ playground</title>
        <script src="${versionedLink('/playground/load-tutorial', contents)}" type="module" defer></script>
        <script src="${versionedLink('/init-fiol.js')}&tutorialVar=tutorial" type="module" defer></script>
      </head>
      <body>
        ${fiolinContainer({ playground: true, tutorial })}
      </body>
    </html>
  `);
});
