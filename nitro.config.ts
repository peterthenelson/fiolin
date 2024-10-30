import { defineNitroConfig } from 'nitropack/config';

const noneCsp = "default-src 'none'";

const indexCsp = [
  "default-src 'self'",
  'connect-src *',
  "frame-ancestors 'none'"
].join('; ');

const workerCsp = [
  "default-src 'self'",
  "script-src 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  'connect-src https://cdn.jsdelivr.net'
].join('; ');

function csp(policy: string) {
  return { headers: { 'Content-Security-Policy': policy } };
}

export default defineNitroConfig({
  srcDir: 'server',
  preset: 'cloudflare-pages-static',
  // TODO: HSTS on prod?
  routeRules: {
    '': { cors: false, ...csp(indexCsp) },
    'index.html': { cors: false, ...csp(indexCsp) },
    'index.js': { cors: false, ...csp(indexCsp) },
    'worker.js': { cors: false, ...csp(workerCsp) },
    's/*': { cors: false, ...csp(noneCsp) },
    // TODO: anything for the wasm files? Also, I expect that might affect the
    // CSPs for the index and worker, depending on how I want the WASM loading
    // to work.
  },
});
