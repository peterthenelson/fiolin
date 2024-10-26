const indexCsp = [
  "default-src 'self'",
  "connect-src *",
  "frame-ancestors 'none'"
].join('; ');

const workerCsp = [
  "default-src 'self'",
  "script-src 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  "connect-src https://cdn.jsdelivr.net"
].join('; ');

export default defineNitroConfig({
  srcDir: "server",
  preset: "cloudflare-pages-static",
  // TODO: HSTS on prod?
  routeRules: {
    '': { cors: false, headers: { 'Content-Security-Policy': indexCsp } },
    'index.html': { cors: false, headers: { 'Content-Security-Policy': indexCsp } },
    'index.js': { cors: false, headers: { 'Content-Security-Policy': indexCsp } },
    'worker.js': { cors: false, headers: { 'Content-Security-Policy': workerCsp } },
    // TODO: anything for the wasm files? Also, I expect that might affect the
    // CSPs for the index and worker, depending on how I want the WASM loading
    // to work.
  },
});
