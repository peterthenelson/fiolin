This is very partial; I have a running notes google doc that has more stuff, but
these are more concrete programming TODOs:
- Get unjs/nitro#2814 merged/released and then revert my local changes to nitro
- Get some other emscripten binary working in the same file-system as pyodide.
  (xpdf? imagemagick?)
- Set up tests involving the web server(s) and selenium or something along those
  lines to check that the security properties hold.
- Get regular jest tests setup using the PyodideRunner (and more specifically
  add a test for unlock-ppt)
- Add minification to the rollup config
- Utility for wrapping those errno errors that the wasm filesystem throws
- More file-conversion example scripts
- Write up README and DESIGN more fully
- Deployment setup for cloudflare pages
- Good looking site with:
 - Landing page with links to local scripts and playground
 - Local scripts
 - Appropriate modal warnings for 3p + localstorage memory of approvals
 - Playground (using monaco) that helps you develop your own script (and
   generates the json)
