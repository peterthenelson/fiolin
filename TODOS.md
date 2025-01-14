A not-necessarily-exhaustive list of TODOs:
- Docs
  - Update docs for template repo
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
  - Forms
    - Get autofocus to work?
  - Canvas
  - Multi-stage callback based scripts
  - Get some emscripten binaries working in the same file-system as pyodide.
    (imagemagick done; maybe a document or ffmpeg one next)
      - Fix unsafe-eval issue with imagemagick
      - Figure out how to pass in bytes to imagemagick read
  - Some kind of (interactive?) canvas functionality
  - Debug command that can trigger some kind of interactive repl
- Scripts
  - Playground examples
    - Demonstrating matplotlib (after I get it to work)
    - Demonstrating canvas (when it works)
    - Demonstrating callbacks (when they work)
  - More file-conversion scripts for real tasks
    - SVG recolor
    - Extracting text and tables from PDFs
    - ImageMagick:
      - Resize / adjust quality of / trim image
      - Make thumbnails
      - Montage, append
      - Combine into GIF / explode out from GIF
      - Make background transparent
      - To grayscale, invert, change colorspace, tint, blur
      - Mirror or rotate
      - Image to PDF
      - Converter for DSLR raw formats
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
    - Run button (on custom form) firing pre-load bug
    - Make custom form lock up during run (and glow)
    - Add a "download files" component for the custom form
    - Make FILE component have a logo and text and panel and whatnot
    - Filtering in output terminal by log level
  - Deployment:
    - Deploy script in the template package.json
