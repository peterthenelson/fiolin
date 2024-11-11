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
  initFiolin(`https://${m[1]}.github.io/${m[2]}`, true);
} else if (url) {
  initFiolin(url, true);
} else {
  die(`Neither gh nor url parameters specified!`);
}