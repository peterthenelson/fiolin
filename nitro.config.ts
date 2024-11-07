import { defineNitroConfig } from 'nitropack/config';

const noneCsp = "default-src 'none'";

const indexCsp = [
  "default-src 'self' 'unsafe-inline'", // TODO: Deal w/unsafe-inline
  'connect-src *',
  "frame-ancestors 'none'"
].join('; ');

const workerCsp = [
  "default-src 'self'",
  "script-src 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  'connect-src https://cdn.jsdelivr.net https://pypi.org https://files.pythonhosted.org'
].join('; ');

function csp(policy: string) {
  return { headers: { 'Content-Security-Policy': policy } };
}

export default defineNitroConfig({
  srcDir: 'server',
  preset: 'cloudflare-pages-static',
  routeRules: {
    '': { cors: false, ...csp(indexCsp) },
    'index.html': { cors: false, ...csp(indexCsp) },
    'index.js': { cors: false, ...csp(indexCsp) },
    'worker.js': { cors: false, ...csp(workerCsp) },
    'playground/': { cors: false, ...csp(indexCsp) },
    'playground/index.html': { cors: false, ...csp(indexCsp) },
    's/*/': { cors: false, ...csp(indexCsp) },
    's/*/index.html': { cors: false, ...csp(indexCsp) },
    's/*/script.json': { cors: false, ...csp(noneCsp) },
  },
});
