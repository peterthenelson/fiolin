import { AutocompleteSuggestion } from '../common/types';
import { Container, ContainerOpts } from '../components/web/container';
import { Autocomplete } from '../components/web/autocomplete';
const monaco = import('../web-utils/monaco');

export async function initFiolin(opts: ContainerOpts): Promise<Container> {
  let endpoints: Record<string, string> = {};
  try {
    const resp = await fetch(`/bundle/versions.json?v=${Math.random()}`);
    endpoints = await resp.json();
  } catch (e) {
    console.error('Failed to load version file for endpoints');
    console.error(e);
  }
  const container = document.getElementById('container');
  if (container === null) {
    die('#container not present; cannot initFiolin');
  }
  return new Container(container, { workerEndpoint: endpoints.worker, ...opts });
}

export function initAutocomplete(opts: { suggestions: AutocompleteSuggestion[] }): Autocomplete {
  const container = document.getElementById('autocomplete');
  if (container === null) {
    die('#autocomplete not present; cannot initAutocomplete');
  }
  return new Autocomplete(container, opts.suggestions);
}

async function colorizeLang(lang: string): Promise<void> {
  const readyMonaco = await monaco;
  await Promise.all(Array.from(
    document.querySelectorAll(`code.language-${lang}`),
    (e) => readyMonaco.colorize(e as HTMLElement, lang)
  ));
}

export async function colorizeExamples(): Promise<void> {
  await Promise.all([
    colorizeLang('py'), colorizeLang('json'), colorizeLang('sh'), colorizeLang('yml'),
  ]);
}

export function die(msg: string): never {
  const scriptDesc = document.querySelector('[data-rel-id="script-desc"]');
  if (scriptDesc === null) {
    console.warn('Failed to find [data-rel-id="script-desc"]');
  } else if (!(scriptDesc instanceof HTMLPreElement)) {
    console.warn('Script description element not <pre> as expected');
  } else {
    scriptDesc.textContent = msg;
  }
  throw new Error(msg);
}
