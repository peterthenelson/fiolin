A not-necessarily-exhaustive list of TODOs:
- Template repo
  - Update docs for template repo
  - Deploy script in the template package.json
  - Other scripts to run and test locally
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
  - Bug w/error propagation across js->py boundary ("return without exception
    set"). Still exists but workaround added.
  - Emscripten modules:
    - Fix unsafe-eval issue with imagemagick
    - ffmpeg 
    - some kind of document conversion thing
    - some kind of ebook converter
    - more archive format converters
  - Canvas
    - Figure out more actual use-cases and work through them
    - How to control visibility? Size updating doesn't work right now.
    - Interaction?
  - Debug command that can trigger some kind of interactive repl
- Scripts
  - Playground examples
    - Demonstrating deployment
    - Demonstrating matplotlib (after I get it to work)
    - Demonstrating interactivity with canvas
  - More file-conversion scripts for real tasks
    - SVG recolor
    - Extracting text and tables from PDFs
    - ImageMagick:
      - Resize / adjust quality of / trim image
      - Make thumbnails
      - Montage, append
      - Combine into GIF / explode out from GIF
      - Make background transparent
      - To invert, change colorspace, tint, blur
      - Image to PDF
      - Converter for DSLR raw formats
    - Extract or convert 7z, cab, jar, rar, zip
    - Convert audio aac, aiff, flac, m4a, mp3, ogg, wav, wma
    - Convert docs djvu, docx, odt, pdf, rtf
    - Convert ebooks azw3, epub, mobi
    - Convert video?
- Frontend
  - Add some transition animations for the buttons to invite interaction.
  - Third party:
    - Add the docs
    - Release publicly by updating prerendering
  - Editor:
    - Why is monaco occasionally triggering a request for clipboard permissions?
  - Controls:
    - Figure out why file components get cleared on reruns
    - Add a "download files" component for the custom form
    - Make FILE component have a logo and text and panel and whatnot
