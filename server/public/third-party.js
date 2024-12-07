import { initFiolin, die } from '/bundle/host.js';
const params = new URLSearchParams(window.location.search);
const gh = params.get('gh');
const url = params.get('url');
if (gh) {
  const re = /^([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)\/([A-Za-z0-9._\/-]+)$/;
  const m = re.exec(gh);
  if (!m) {
    die(`Invalid gh parameter; ${gh}`);
  } 
  initFiolin({ url: `https://${m[1]}.github.io/${m[2]}.json`, showLoading: true });
} else if (url) {
  initFiolin({ url, showLoading: true});
} else {
  die(`Neither gh nor url parameters specified!`);
}