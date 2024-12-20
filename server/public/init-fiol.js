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
  const fiol = params.get('fiol')
  const tutorialVar = params.get('tutorialVar')
  if (fiol) {
    host.initFiolin({ url: `/s/${fiol}/script.json` });
  } else if (tutorialVar) {
    const tutorial = window[tutorialVar];
    if (tutorial) {
      host.initFiolin({ tutorial });
    } else {
      console.error(`window.${tutorialVar} doesn't exist`)
    }
  } else {
    console.error('No fiol or tutorialVar query parameters; skipping initialization');
  }
});