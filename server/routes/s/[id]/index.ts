import { loadScript } from "../../../../utils/config";
import { dedent } from "../../../../common/indent";
import { fiolinContainer, fiolinSharedHeaders } from "../../../../utils/html";

export default defineEventHandler((event) => {
  const name = getRouterParam(event, 'id')
  const script = loadScript(name);
  return dedent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${name} - ƒɪᴏʟɪɴ</title>
        ${fiolinSharedHeaders()}
        <script src="/init-fiol.js?fiol=${name}" type="module" defer></script>
      </head>
      <body>
        ${fiolinContainer({ title: script.meta.title, desc: script.meta.description })}
        <a href="/s/${name}/script.json" class="hidden">fiolin script source</a>
      </body>
    </html>
  `);
});
