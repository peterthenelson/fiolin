# Ideas

## Core Improvements

**CSP: eliminate `unsafe-eval` for ImageMagick**
The worker CSP currently requires `unsafe-eval` because of how `@imagemagick/magick-wasm` initializes. Auditing whether the module can be loaded in a way that isolates this — or switching to an alternative WASM image library — would tighten the security model without sacrificing functionality. See `nitro.config.ts:39`.

**Autocomplete quality**
The current indexing and scoring are minimal (see `components/web/autocomplete.ts:4`). A trigram index with extension-aware ranking would make the catalog more discoverable as the number of scripts grows.

**Form reset between runs**
File/run/output-display components aren't reset between successive runs of the same script (see `components/web/custom-form.ts:96-111`). This is a likely papercut for scripts run repeatedly with different inputs.

**Offline toolchain / npm package**
The CLI (`npm run fiol`) works locally but isn't packaged for external use (see `cli/cli.ts:3`). Publishing to npm or as a standalone binary (via `bun build --compile` or `pkg`) would let power users run fiols without a browser.

**Runner debug section**
There's a TODO at `common/types/runner.ts:15` to add a debug section. Structured timing output (Pyodide init time, package install time, script execution time) would make slow scripts much easier to diagnose.

**Third-party script trust UX**
The design doc notes that a 3p script could silently ignore input and output anything it wants. Showing the script source (or a clear "you are running code from `github.com/<user>`" prompt) before the first run would improve informed consent.

---

## New Fiols

### Image & Document

- **PDF → images** — export each page as PNG/JPEG (PyMuPDF or pdf2image)
- **Split PDF** — extract a page range or split into one-file-per-page
- **Compress/resize image** — resize to a target pixel size or file size, with quality slider
- **Add watermark** — stamp text or an image watermark onto a PDF or image
- **HEIC → JPEG** — common iPhone photo sharing pain point

### File Format Conversion

- **CSV ↔ JSON** — bidirectional with optional nesting/flattening controlled via form fields
- **Markdown → HTML** — render a `.md` to standalone HTML (Marked is already a dependency)

### Audio / Video (requires adding ffmpeg.wasm)

- **Trim audio** — cut a clip to a start/end timestamp
- **Extract audio from video** — rip an MP3 from an MP4

### Utility

- **Zip files** — complement to the existing extract fiols; zip a set of MULTI inputs
- **Bulk rename** — MULTI input, a rename-pattern form field, outputs renamed copies
- **Compute checksums** — output a `.sha256` sidecar for one or more files
