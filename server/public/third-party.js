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
  const url = params.get('url');
  if (gh) {
    const re = /^([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)\/([A-Za-z0-9._\/-]+)$/;
    const m = re.exec(gh);
    if (!m) {
      die(`Invalid gh parameter; ${gh}`);
    } 
    host.initFiolin({ url: `https://${m[1]}.github.io/${m[2]}.json`, showLoading: true });
  } else if (url) {
    host.initFiolin({ url, showLoading: true});
  } else {
    host.die(`Neither gh nor url parameters specified!`);
  }
});