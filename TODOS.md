A not-necessarily-exhaustive list of TODOs:
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
  - Some kind of flag parsing functionality
  - Get some other emscripten binary working in the same file-system as pyodide.
    (xpdf? imagemagick?)
  - More file-conversion example scripts
    - SVG recolor
    - ImageMagick:
      - Resize / adjust quality of / trim image
      - View or strip EXIF / other metadata
      - Make ICOs
      - Make thumbnails
      - Montage, append
      - Combine into GIF / explode out from GIF
      - Make background transparent
      - To grayscale, invert, change colorspace, tint, blur
      - Mirror or rotate
      - Image to PDF
    - Extract or convert 7z, cab, jar, rar, tar, tar.gz, tbz2, zip
    - Convert audio aac, aiff, flac, m4a, mp3, ogg, wav, wma
    - Convert docs djvu, docx, odt, pdf, rtf
    - Convert ebooks azw3, epub, mobi
    - Convert image ...
    - Convert video ...
- Frontend
  - Better UI for input / output filesystem to allow for multiple files (and
    remember to lock up 'run' button during installPkgs step and during any
    runs)
  - Using the installPkgs to decrease perceived latency
  - Autocomplete search for landing page.
  - Improve styling for all pages
  - Link to documentation on landing page
  - Appropriate modal warnings for 3p + localstorage memory of approvals
  - Ability to edit script metadata in the editor and a json-generator button
