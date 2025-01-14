import { loadAllTutorials } from '../../../utils/config';
import { dedent } from '../../../common/indent';
import { fiolinSharedHeaders } from '../../html';
import { renderContainer } from '../../../components/server/container';
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
        <script src="${versionedLink('/init-fiol.js')}&tutorialVar=tutorials" type="module" defer></script>
      </head>
      <body>
        ${renderContainer({ playground: true, tutorial, numSpaces: 4 })}
      </body>
    </html>
  `);
});
