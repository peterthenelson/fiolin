This is very partial; I have a running notes google doc that has more stuff, but
these are more concrete programming TODOs:
- Documentation
  - Flesh out DESIGN
  - Add intro to README
  - Landing page copy
- Dev server and release:
  - Get unjs/nitro#2814 merged/released and then revert my local changes to
    nitro; alternately reimplement functionality I need w/o nitro.
  - Set up tests involving the web server(s) and playwright to check that the
    security properties hold.
  - Deployment setup for cloudflare pages and update README
  - HSTS for prod? Any updates to headers for wasm files?
- Core functionality
  - Utility for wrapping those errno errors that the wasm filesystem throws
  - Proper resetting of file system between runs
  - Checking for none/single/multi
  - Get some other emscripten binary working in the same file-system as pyodide.
    (xpdf? imagemagick?)
  - Figure out my story for pip pkgs
  - More file-conversion example scripts
    - TNEF/Winfile.dat extractor
- Frontend
  - Better UI for input / output filesystem to allow for multiple files
  - Add minification to the rollup config
  - Add landing page / autocomplete search / links to playground & docs
  - Have the local scripts as sub-pages
  - Appropriate modal warnings for 3p + localstorage memory of approvals
  - Playground (using monaco) that helps you develop your own script (and
    generates the json)
