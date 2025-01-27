import { loadScript } from '../../../../utils/config';
import { dedent } from '../../../../common/indent';
import { fiolinSharedHeaders } from '../../../html';
import { versionedLink } from '../../../../utils/versioned-link';
import { renderContainer } from '../../../../components/server/container';

export default defineEventHandler((event) => {
  const name = getRouterParam(event, 'id')
  const script = loadScript(name);
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        ${fiolinSharedHeaders()}
        <title>${name} - ƒɪᴏʟɪɴ</title>
        <script src="${versionedLink('/init-fiol.js')}&fiol=${name}" type="module" defer></script>
      </head>
      <body>
        ${renderContainer({ mode: '1P', title: script.meta.title, desc: script.meta.description, numSpaces: 4 })}
        <a href="/s/${name}/script.json" class="hidden">fiolin script source</a>
      </body>
    </html>
  `);
});
