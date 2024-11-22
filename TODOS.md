A not-necessarily-exhaustive list of TODOs:
- Documentation
  - Landing page copy
  - Add quick-start to the README and the doc/index.md
  - Update the repo template as needed
- Dev server and release:
  - Get unjs/nitro#2814 merged/released and then revert my local changes.
  - Set up tests involving the web server(s) and playwright to check that the
    security properties hold.
  - HSTS for prod? Any updates to headers for wasm files?
  - Maybe switch the release to a different branch and make the building/testing
    all happen locally and then just copy dist to a different branch. Also,
    use a different folder than dist, since I'll need that for the npm package.
  - Figure out what in the world I want in terms of distributing this as an npm
    package so that people can import fiolin from their fiolin-template cloned
    projects and do local development.
- Core functionality
  - Some kind of flag parsing functionality
  - Get some other emscripten binary working in the same file-system as pyodide.
    (xpdf? imagemagick?)
  - Some kind of (interactive?) canvas functionality
- Scripts
  - Playground examples
    - Demonstrating input/output arity
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
    - Extract or convert 7z, cab, jar, rar, tar, tar.gz, tbz2, zip
    - Convert audio aac, aiff, flac, m4a, mp3, ogg, wav, wma
    - Convert docs djvu, docx, odt, pdf, rtf
    - Convert ebooks azw3, epub, mobi
    - Convert video?
- Frontend
  - File an issue button
  - Landing page: autocomplete
  - 3p page: modal warnings, different background, localstorage of approvals
  - Editor and playground:
    - Example chooser for playground.
    - Why is monaco occasionally triggering a request for clipboard permissions?
    - Add some transition animations for the buttons to invite interaction.
    - Ability to edit script metadata in the editor.
  - Controls:
    - Improve the "simple" file UI to allow for resetting and redownloading, as
      well as different file arities.
    - Advanced UI options other than the "simple" version.
  - Deployment:
    - Detection of OS to set script lang.
    - Bat file version of script.
    - Localstorage memory of settings.
