import { initFiolin } from '/bundle/host.js';
const fiol = new URL(import.meta.url).searchParams.get('fiol')
if (!fiol) {
  console.log('No fiol query parameter; skipping initialization');
} else {
  initFiolin(`/s/${fiol}/script.json`);
}