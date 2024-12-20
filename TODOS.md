A not-necessarily-exhaustive list of TODOs:
- Dev server and release:
  - Get unjs/nitro#2814 merged/released and then revert my local changes.
  - Set up tests involving the web server(s) and playwright to check that the
    security properties hold.
  - Maybe switch the release to a different branch and make the building/testing
    all happen locally and then just copy dist to a different branch. Also,
    use a different folder than dist, since I'll need that for the npm package.
  - Figure out what in the world I want in terms of distributing this as an npm
    package so that people can import fiolin from their fiolin-template cloned
    projects and do local development. Update the repo template as needed.
- Core functionality
  - Some kind of flag parsing functionality
  - Get some other emscripten binary working in the same file-system as pyodide.
    (xpdf? imagemagick?)
      - Fix unsafe-eval issue with imagemagick
  - Some kind of (interactive?) canvas functionality
- Scripts
  - Playground examples
    - Demonstrating PyPI packages
    - Demonstrating ImageMagick or some WASM thing
    - Demonstrating advanced UI
  - More file-conversion scripts for real tasks
    - SVG recolor
    - Extracting text and tables from PDFs
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
      - Convert formats
    - Extract or convert 7z, cab, jar, rar, zip
    - Convert audio aac, aiff, flac, m4a, mp3, ogg, wav, wma
    - Convert docs djvu, docx, odt, pdf, rtf
    - Convert ebooks azw3, epub, mobi
    - Convert video?
- Frontend
  - Landing page: autocomplete
  - 3p page: modal warnings, dev avatar, localstorage of approvals
  - Editor and playground:
    - Why is monaco occasionally triggering a request for clipboard permissions?
    - Add some transition animations for the buttons to invite interaction.
  - Controls:
    - Filtering in output terminal by log level
    - Improve the "simple" file UI to allow for resetting and redownloading.
    - Advanced UI options other than the "simple" version.
  - Deployment:
    - Deploy script in the template package.json
