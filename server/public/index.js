let endpoints = {};
try {
  const resp = await fetch(`/bundle/versions.json?v=${Math.random()}`);
  endpoints = await resp.json();
} catch (e) {
  console.error('Failed to load version file for endpoints');
  console.error(e);
}
import(endpoints.host || '/bundle/host.js').then((host) => {
  const params = new URL(import.meta.url).searchParams;
  const suggestionsVar = params.get('suggestionsVar');
  if (suggestionsVar) {
    const suggestions = window[suggestionsVar];
    if (suggestions) {
      window.autocomplete = host.initAutocomplete({ suggestions });
    } else {
      console.error(`window.${suggestionsVar} doesn't exist`)
    }
  } else {
    console.error('No suggestionsVar query parameter; skipping initialization');
  }
});