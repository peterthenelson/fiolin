# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Fiolin** ("A Fiddle For Files") is a browser-based file transformation platform. Users write Python scripts that manipulate files; non-technical users run those scripts entirely in their browser via Pyodide (Python compiled to WASM). No file uploads to third-party servers — all computation is local.

## Commands

```bash
# Development (runs doc watcher + rollup watcher + Nitro dev server on port 3000 + fake 3p server on port 3001)
npm run dev

# Full build: docs → TypeScript → Rollup → Nitro
npm run build

# Individual build steps
npm run build:tsc      # TypeScript compilation for all workspace packages
npm run build:rollup   # Rollup bundles (host.js + worker.js)

# Tests (Vitest, 30s timeout)
npm run test

# Run a specific test file
npx vitest run fiols/unlock-ppt.test.ts

# Run a script via CLI
npm run fiol -- <script-name> --input <file> --outputDir <dir>
```

## Architecture

### Execution Model

Scripts run in a **Web Worker** (isolation from main thread), executing Python via **Pyodide**. The main thread manages UI and posts typed messages to the worker:

1. `INSTALL_PACKAGES` → worker installs PyPI packages from script manifest
2. `RUN` → worker executes the Python script with input files

**`common/runner.ts`** (`PyodideRunner`) is the core: initializes Pyodide with restricted JS globals, manages file system (`/input`, `/output`, `/tmp`), executes scripts, and collects outputs.

**`web-host/host.ts`** is the main-thread entry point (initializes `Container` + autocomplete).  
**`web-worker/worker.ts`** is the worker entry point (handles the `INSTALL_PACKAGES`/`RUN` message loop).

### Script Format

A Fiolin script is a YAML manifest (`.yml`) paired with Python code (`.py`) — or the Python can be inlined in the YAML under `code.python`. First-party scripts live in `fiols/`. The type definition is in `common/types/fiolin-script.ts`.

```yaml
meta:
  title: "My Script"
  description: "..."
interface:
  inputFiles: SINGLE  # SINGLE | MULTI | NONE | ANY
  outputFiles: SINGLE
  form: [...]         # optional typed form fields
runtime:
  pythonPkgs:
    - { type: PYPI, name: pillow }
  wasmModules:
    - { name: IMAGEMAGICK }
code:
  python: |
    import fiolin
    # use fiolin.get_input_file(), fiolin.set_output_file(), etc.
```

### Workspace Layout

The repo uses npm workspaces with TypeScript project references (`tsc -b`):

| Package | Purpose |
|---|---|
| `common/` | `PyodideRunner`, type definitions, parsers — shared by browser and Node |
| `web-host/` | Main-thread bundle entry; owns `Container` (editor, form, terminal, worker) |
| `web-worker/` | Worker bundle entry; script execution |
| `web-utils/` | Browser utilities: WASM loaders, Monaco helpers, worker message types |
| `components/web/` | UI components (vanilla TS, no framework) |
| `components/server/` | SSR components for Nitro |
| `server/` | Nitro routes — pages at `/s/:author/:name`, docs at `/doc/*`, catalog, playground |
| `utils/` | Node-side script loading and `NodeFiolinRunner` (used by CLI) |
| `cli/` | `citty`-based CLI (`npm run fiol`) |
| `fiols/` | First-party scripts (`.yml` + `.py` + `.test.ts` per script) |
| `fake3p/` | Local fake third-party server for dev/testing |
| `scripts/` | Build utilities: `doc.ts` (auto-generates docs), `dev.ts` (orchestrates dev) |

### Server / Deployment

Nitro with `cloudflare-pages-static` preset — the site is **fully prerendered** (static HTML). Routes are in `server/routes/`. CSP headers are defined in `nitro.config.ts` (separate policies for the main page, worker endpoint, and third-party script page).

The worker bundle (`server/public/bundle/worker.js`) requires `wasm-unsafe-eval` and `unsafe-eval` because of Pyodide. The main page CSP is stricter.

### Security Invariants

- Python scripts run in a Web Worker with no DOM access.
- Pyodide `jsglobals` is restricted to `Array`, `Map`, `Object`, `Promise` — no `fetch`, no `XMLHttpRequest`.
- Third-party scripts are fetched from GitHub Pages (CORS) and validated against declared outputs after execution.
- User files never leave the browser.

### Testing

Tests use Vitest. Integration tests for scripts in `fiols/*.test.ts` use real Pyodide and sample files from `fiols/testdata/`. Component tests use Happy-DOM (`components/test/`).
