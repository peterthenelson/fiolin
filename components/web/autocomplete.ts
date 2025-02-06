import { AutocompleteSuggestion } from '../../common/types';
import { getByRelIdAs } from '../../web-utils/select-as';

// TODO: The indexing/signal extraction/score should be good instead of
// some random thing off the top of my head.
interface IndexedSuggestion {
  id: string;
  link: string;
  linkText: string;
  terms: string[];
}

interface Signals {
  exactTermMatches: number;
  termInclusions: number;
}

export class Autocomplete {
  private readonly container: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly list: HTMLUListElement;
  private readonly suggestions: IndexedSuggestion[];

  constructor(container: HTMLElement, suggestions: AutocompleteSuggestion[]) {
    this.container = container;
    this.input = getByRelIdAs(container, 'autocomplete-input', HTMLInputElement);
    this.list = getByRelIdAs(container, 'autocomplete-list', HTMLUListElement);
    this.suggestions = suggestions.map((s) => this.index(s));
    this.setUpHandlers();
  }

  private setUpHandlers() {
    this.input.oninput = () => {
      this.display(this.ranked(this.input.value, 5));
    }
    this.input.onfocus = () => {
      if (this.input.value !== '') {
        this.display(this.ranked(this.input.value, 5));
      }
    }
    this.container.addEventListener('focusout', (e) => {
      const rt = e.relatedTarget;
      if (rt === null || (rt instanceof HTMLElement && !this.container.contains(rt))) {
        this.list.classList.add('hidden');
      }
    });
  }

  private index(suggestion: AutocompleteSuggestion): IndexedSuggestion {
    const indexed: IndexedSuggestion = {
      id: suggestion.id, link: suggestion.link,
      linkText: suggestion.meta.title, terms: [],
    };
    indexed.terms.push(...suggestion.meta.title.split(/\s+/).map((s) => s.toLowerCase()));
    indexed.terms.push(...suggestion.meta.description.split(/\s+/).map((s) => s.toLowerCase()));
    indexed.terms.push(...(suggestion.meta.extensions || []));
    return indexed;
  }

  private signals(query: string, item: IndexedSuggestion): Signals {
    const queryTerms = query.toLowerCase().split(/\s+/);
    let signals: Signals = { exactTermMatches: 0, termInclusions: 0 };
    for (const q of queryTerms) {
      for (const d of item.terms) {
        if (q === d) {
          signals.exactTermMatches++;
        } else if (d.includes(q)) {
          signals.termInclusions++;
        }
      }
    }
    return signals;
  }

  private score(signals: Signals): number {
    return signals.exactTermMatches*3 + signals.termInclusions;
  }

  private ranked(query: string, maxResults: number): IndexedSuggestion[] {
    const matches: [number, IndexedSuggestion][] = this.suggestions.map((s) => {
      return [this.score(this.signals(query, s)), s];
    });
    matches.sort((a, b) => b[0] - a[0]);
    return matches.slice(0, maxResults).map(([_, s]) => s);
  }

  private display(suggestions: IndexedSuggestion[]): void {
    this.list.replaceChildren(...suggestions.map((item) => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.link;
      link.innerText = item.linkText;
      listItem.appendChild(link);
      this.list.appendChild(listItem);
      return listItem;
    }));
    if (suggestions.length > 0) {
      this.list.classList.remove('hidden');
    } else {
      this.list.classList.add('hidden');
    }
  }

  public debug(query: string): [Signals, IndexedSuggestion][] {
    return this.suggestions.map((s) => [this.signals(query, s), s]);
  }
}