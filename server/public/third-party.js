let endpoints = {};
try {
  const resp = await fetch(`/bundle/versions.json?v=${Math.random()}`);
  endpoints = await resp.json();
} catch (e) {
  console.error('Failed to load version file for endpoints');
  console.error(e);
}
import(endpoints.host || '/bundle/host.js').then((host) => {
  const params = new URLSearchParams(window.location.search);
  const gh = params.get('gh');
  let base = params.get('base');
  if (base !== null && !base.match(/http:\/\/localhost:\d+/)) {
    die(`base parameter must be http://localhost:PORT; got ${base}`);
  }
  if (gh) {
    const re = /^([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)\/([A-Za-z0-9._\/-]+)$/;
    const m = re.exec(gh);
    if (!m) {
      die(`Invalid gh parameter; ${gh}`);
    } 
    host.initFiolin({ type: '3P', username: m[1], path: m[2], githubIoBase: base || undefined });
  } else {
    host.die(`gh parameter not specified!`);
  }
});