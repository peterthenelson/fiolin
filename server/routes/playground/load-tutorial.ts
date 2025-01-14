import { loadAllTutorials } from '../../../utils/config';
import { indent, dedent } from '../../../common/indent';

export default defineEventHandler(async (request) => {
  const tutorials = await loadAllTutorials();
  return new Response(
    dedent(`
      window.tutorials = ${indent(JSON.stringify(tutorials, null, 2), '      ')};
    `),
    { headers: { 'content-type': 'text/javascript' } }
  );
});