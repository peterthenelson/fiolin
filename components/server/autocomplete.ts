import { redent } from '../../common/indent';
import { AutocompleteSuggestion, FiolinScript } from '../../common/types';

export function generateSuggestions(scripts: Record<string, FiolinScript>): AutocompleteSuggestion[] {
  const suggestions: AutocompleteSuggestion[] = [];
  for (const [id, script] of Object.entries(scripts)) {
    suggestions.push({ id, link: `/s/${id}/`, meta: script.meta });
  }
  return suggestions;
}

export function renderAutocomplete(numSpaces: number): string {
  return redent(`
    <div id="autocomplete" class="autocomplete">
      <input type="text" class="autocomplete-input"
       data-rel-id="autocomplete-input" placeholder="Search for a task...">
      <ul class="autocomplete-list hidden" data-rel-id="autocomplete-list"></ul>
    </div>
  `, ' '.repeat(numSpaces));
}