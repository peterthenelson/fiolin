This is very partial; I have a running notes google doc that has more stuff, but
these are more concrete programming tasks:

- Get unjs/nitro#2814 merged/released and then revert my local changes to nitro
- Get some other emscripten binary working in the same file-system as pyodide.
  (xpdf? imagemagick?)
- Set up tests involving the web server(s) and selenium or something along those
  lines to check that the security properties hold.
- More file-conversion example scripts
 - Note: revisit fiol logic to ensure files retrieved relative to project dir
 - Note: figure out "bin" stuff to avoid having to type `npx jit cli/cli.ts`
- Migrate the browser scripts (index.js and worker.js) to typescript (so they
  share stuff w/offline code) and work out the compilation, bundling, and dev
  server setup so that it all works with that.
- Write up README and DESIGN more fully
- Good looking site with:
 - Landing page with links to local scripts and playground
 - Local scripts
 - Appropriate modal warnings for 3p + localstorage memory of approvals
 - Playground that helps you develop your own script (and generates the json)
