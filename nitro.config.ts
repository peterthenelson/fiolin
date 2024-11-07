import { defineNitroConfig } from 'nitropack/config';

const noneCsp = "default-src 'none'";

const indexCsp = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'", // Note: inline results from monaco
  "frame-ancestors 'none'"
];

const thirdPartyCsp = indexCsp.concat('connect-src *');

const workerCsp = [
  "default-src 'self'",
  "script-src 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  'connect-src https://cdn.jsdelivr.net https://pypi.org https://files.pythonhosted.org'
];

function csp(policy: string | string[]) {
  if (Array.isArray(policy)) {
    policy = policy.join('; ');
  }
  return { headers: { 'Content-Security-Policy': policy } };
}

export default defineNitroConfig({
  srcDir: 'server',
  preset: 'cloudflare-pages-static',
  routeRules: {
    '': { cors: false, ...csp(indexCsp) },
    'index.html': { cors: false, ...csp(indexCsp) },
    'index.js': { cors: false, ...csp(indexCsp) },
    'host.js': { cors: false, ...csp(indexCsp) },
    'worker.js': { cors: false, ...csp(workerCsp) },
    'init-fiol.js': { cors: false, ...csp(indexCsp) },
    'playground/': { cors: false, ...csp(indexCsp) },
    'playground/index.html': { cors: false, ...csp(indexCsp) },
    'playground/index.js': { cors: false, ...csp(indexCsp) },
    'third-party/': { cors: false, ...csp(thirdPartyCsp) },
    'third-party/index.html': { cors: false, ...csp(thirdPartyCsp) },
    'third-party/index.js': { cors: false, ...csp(thirdPartyCsp) },
    's/*/': { cors: false, ...csp(indexCsp) },
    's/*/index.html': { cors: false, ...csp(indexCsp) },
    's/*/script.json': { cors: false, ...csp(noneCsp) },
  },
});
