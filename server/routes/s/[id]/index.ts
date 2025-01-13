import { loadScript } from '../../../../utils/config';
import { dedent } from '../../../../common/indent';
import { fiolinContainer, fiolinSharedHeaders } from '../../../html';
import { versionedLink } from '../../../../utils/versioned-link';

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
        ${fiolinContainer({ title: script.meta.title, desc: script.meta.description })}
        <a href="/s/${name}/script.json" class="hidden">fiolin script source</a>
      </body>
    </html>
  `);
});
