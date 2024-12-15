let endpoints = {};
try {
  const resp = await fetch(`/bundle/versions.json?v=${Math.random()}`);
  endpoints = await resp.json();
} catch (e) {
  console.error('Failed to load version file for endpoints');
  console.error(e);
}
import(endpoints.host || '/bundle/host.js').then((host) => {
  host.colorizeExamples();
});