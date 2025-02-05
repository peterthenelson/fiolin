import { generateSuggestions } from '../../components/server/autocomplete';
import { loadAll } from '../../utils/config';
import { dedent, indent } from '../../common/indent';

export default defineEventHandler(async (request) => {
  const scripts = await loadAll();
  const suggestions = generateSuggestions(scripts);
  return new Response(
    dedent(`
      window.suggestions = ${indent(JSON.stringify(suggestions, null, 2), '      ')};
    `),
    { headers: { 'content-type': 'text/javascript' } }
  );
});