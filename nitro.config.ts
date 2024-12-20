import { NitroRouteConfig } from 'nitropack';
import { defineNitroConfig } from 'nitropack/config';

// This CSP disallows everything and is the fallback for anything not explicitly
// assigned a different CSP.
const noneCsp = "default-src 'none'; frame-ancestors 'none'";

const commonCsp = [
  // Default to self only.
  "default-src 'self'",
  // Note: base64 images used by monaco
  "img-src 'self' data:",
  // Note: inline css is used by monaco.
  "style-src 'self' 'unsafe-inline'",
  // No iframing of this page allowed.
  "frame-ancestors 'none'"
];

// The host/UI page and code use this CSP.
// Note: cloudflare analytics
const indexCsp = commonCsp.concat([
  "connect-src 'self' https://cloudflareinsights.com/cdn-cgi/rum",
  "script-src 'self' https://static.cloudflareinsights.com/beacon.min.js",
]);

// The 3p host/UI page additionally needs to fetch scripts from github.
// (and the dev version needs to hit localhost)
const thirdPartyCsp = commonCsp.concat('connect-src https://*.github.io http://localhost:3001');

// The worker/script runner can use WASM and access pyodide and pypi packages.
// TODO: Can this be narrowed?
const workerCsp = [
  "default-src 'self'",
  "script-src 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  "connect-src 'self' https://cdn.jsdelivr.net https://pypi.org https://files.pythonhosted.org"
];

function csp(policy: string | string[]) {
  if (Array.isArray(policy)) {
    policy = policy.join('; ');
  }
  return { headers: { 'Content-Security-Policy': policy } };
}

const loadTutorial: NitroRouteConfig = {
  headers: {
    'Content-Type': 'text/javascript',
    ...csp(noneCsp).headers
  }
}

export default defineNitroConfig({
  srcDir: 'server',
  preset: 'cloudflare-pages-static',
  routeRules: {
    '/': csp(indexCsp),
    '/index.html': csp(indexCsp),
    '/index.js': csp(indexCsp),
    '/bundle/host.js': csp(indexCsp),
    '/bundle/worker.js': csp(workerCsp),
    '/init-fiol.js': csp(indexCsp),
    '/playground/': csp(indexCsp),
    '/playground/index.html': csp(indexCsp),
    '/playground/load-tutorial': loadTutorial,
    '/third-party/': csp(thirdPartyCsp),
    '/third-party/index.html': csp(thirdPartyCsp),
    '/third-party/index.js': csp(thirdPartyCsp),
    '/s/*/': csp(indexCsp),
    '/s/*/index.html': csp(indexCsp),
    '/doc/*': csp(indexCsp),
    // TODO: Figure out how to get fallbacks to work w/cloudflare _headers
    // (This doesn't, as it ends up applying noneCsp to everything.)
    // '/**': csp(noneCsp),
  },
  prerender: {
    routes: ['/', '/playground/load-tutorial'],
    crawlLinks: true,
  }
});
