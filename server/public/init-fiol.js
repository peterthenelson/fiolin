import { initFiolin } from '/bundle/host.js';
const params = new URL(import.meta.url).searchParams;
const fiol = params.get('fiol')
const tutorialVar = params.get('tutorialVar')
if (fiol) {
  initFiolin({ url: `/s/${fiol}/script.json` });
} else if (tutorialVar) {
  const tutorial = window[tutorialVar];
  if (tutorial) {
    initFiolin({ tutorial });
  } else {
    console.error(`window.${tutorialVar} doesn't exist`)
  }
} else {
  console.error('No fiol or tutorialVar query parameters; skipping initialization');
}