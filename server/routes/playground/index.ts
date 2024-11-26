import { loadAllTutorials } from '../../../utils/config';
import { dedent } from '../../../common/indent';
import { fiolinContainer, fiolinSharedHeaders, versionedLink } from '../../../utils/html';

export default defineEventHandler(async () => {
  const contents = JSON.stringify(await loadAllTutorials());
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
        ${fiolinContainer({ playground: true })}
      </body>
    </html>
  `);
});
