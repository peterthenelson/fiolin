# Fiolin

_A Fiddle For Files_

**tl;dr:** Write simple scripts that manipulate files. Share them with your
friends. Run them locally in your browser.

## Motivation and Overview

Personal computing has turned out differently than I imagined. We all carry
around pocket sized super-computers 100 million times more powerful than the 
Apple IIɢꜱ I played Oregon Trail on as a child. A million books or two years of
audio can fit onto an SD card the size of my fingernail. Programming is the most
accessible it has ever been: compilers cost nothing; tutorials, books, and
courses are numerous and mostly free; and thousands upon thousands of
open-source libraries are just a few clicks away.

And yet. No one ever installs software unless it's been personally approved by
Gabe Newell or the ghost of Steve Jobs. Our super-computers act mostly as dumb
terminals. All our files live in a data center in Virginia anyway, and as for
songs, we don't actually own any to begin with. When faced with simple math
problems, we find it most convenient to use the immense computational might of
our computers to send the question over to OpenAI, where an artificial mind that
is fluent in English and many other languages will decide, after some
contemplation, to delegate the task to a calculator, since arithmetic isn't
really its strong suit.

To put it mildly, there is a big gap between what a programmer can achieve
locally on their own computer and what a non-programmer is typically able to do
on theirs. And there's very little a programmer can do to easily share their
creations with their non-programmer friends and relatives.

Fiolin's thesis is this:
- The average person ("the user") has some problems that an average programmer
  ("the developer") could solve pretty easily.
- Many of these problems take the form of transforming a file or files. E.g.,
  converting between formats, merging PDFs, etc.
- The user's own computer is powerful enough to run the resulting programs
  locally, without needing to upload data to a third party's server.
- Some of these problems can be solved within the security model and computing
  environment of the browser. Therefore:
  - The user won't need to install anything or trust any third party with access
    to their files.
  - The developer won't need to run a server in order to share their solutions
    with other people; they can just upload a static file to github.

## Design

Fiolin is composed of several pieces: the UI, the script runner, the scripts
themselves, and any libraries needed by the scripts.

- All first party assets are hosted on Cloudflare Pages. There is no server-side
  computation, just static files and their `_headers`.
- The code for the UI runs in the main thread. The playground uses Monaco for
  editing the script. The UI is also responsible for fetching 3p scripts and
  communicates with the script runner via `postMessage`.
- The script runner runs in a web worker. It uses pyodide to run scripts and
  also provides some non-python libraries via WASM.
- The scripts themselves are either:
  - First party: hosted alongside the other Fiolin assets.
  - Third party: hosted on github.io as json files; retrieved via CORS.

## Security

Fiolin is intended to allow for two classes of users to interact safely:
- Developers should be able to write arbitrary scripts that operate over a
  given file or directory and either print to stdout or create output files.
- Users should be able to interact with these scripts without fear that the
  files they choose will be exfiltrated, even to the developer who wrote the
  script.  Computation should be entirely local, and no network requests
  whatsoever should be sent to developer-chosen servers.

These safety properties are primarily provided by CSPs, but I try to
characterize what the security properties are for my other technical choices as
well.

### Content Security Policies

- These direct the browser to disallow certain behaviors (e.g., sending
  XMLHTTPRequests, wrapping the site in an iframe, running inline scripts, etc.).
- The most directly relevant types of directives are `connect-src`, `script-src`,
  and `worker-src`, but honestly any type of inclusion of a resource from an
  attacker-controlled domain could result in data exfiltration, so the default
  fallback will be `'self'`, with only some whitelisted exceptions beyond that.
- It's possible to limit script sources to particular domains or even to files
  with particular hashes. However, it's unfortunately the case that wasm is
  currently all (`wasm-unsafe-eval`) or nothing. This is, however, orthogonal to
  the ability to fetch stuff to begin with, so it doesn't open up any new
  exfiltration concerns.
- The UI and the worker with the script runner will have different CSPs. The
  script runner will not, for instance, be response (or allowed!) to fetch the
  3p scripts itself.
- See [this config](/nitro.config.ts) for the specifics.

### Web Workers

The script runner is not running in the main browser thread itself but rather in
a web-worker. The main thread/worker boundary isn't conceptualized as a sandbox
by the standard, but it is nonetheless true that workers do not have access to
the `window` object or, indeed, direct access to _any_ objects from the main
thread. Instead, there is an alternate context object (`self`) that supports a
subset of what `window` does (most obviously no access to the DOM), and the
worker can communicate with the main thread via messages. The messages can
contain objects, but only those that can be serialized. In Fiolin, communication
between the worker and main thread takes place through some very narrowly scoped
message types. Within the worker, the only functions of security relevance are
`fetch` and `importScript`. These are constrained by the CSP.

### WASM

WASM itself provides an excellent sandbox for the code running in it. However,
emscripten can easily blow huge holes in the sandbox when, for example, you link
in support for sockets. The compiled artifacts include both the sandboxed WASM
and the (sandbox compromising) javascript glue code in a big unreadable bundle.
It will require some additional work to characterize what threats WASM-in-Fiolin
will bring, but again, the ability to use anything gained here is mitigated by
the CSP of the worker.

### Pyodide

My basic opinion is that pyodide itself is not all that well sandboxed, but
there are several mitigations:

- We initialize pyodide with a custom `options.jsglobals` and expose very little
  to it. Fetching of any sort is only available during the `installPkgs` phase.
- We run pyodide in a web worker (see above). A jail-broken pyodide shouldn't be
  able to directly do anything to the main thread that a regular Fiolin script
  using the approved APIs couldn't already do.
- Network exfiltration via `fetch` (and related APIs) is limited via CSP (both
  in the main thread and the worker).

### Caveats

- Obvious Assumptions:
  - We rely on the browser and its security guarantees to work.
  - We rely on Cloudflare Pages hosting to not do evil things.
  - SSL for the actual production deployment.
- More subtle points:
  - We rely on PyPI and the jsdelivr sites to be trustworthy (i.e., act as dumb
    repositories of files).
  - The third-party script experience for users tries to make this clear, but
    while Fiolin will not _share your files_ with anyone when you run 3p
    scripts, it has no control over whether the scripts actually work as
    advertised. To give a silly but suggestive example, a third-party script
    could claim to convert pngs to jpgs but actually just ignore the input file
    and output a picture of Rick Astley.

## Alternatives Considered

- **Desktop apps of any kind:** This whole project was motivated by the
  hopelessness of getting casual users to install desktop applications. So,
  definitely not. Fiolin absolutely must have a no-install experience.
- **Actual shell scripts in browser:** WASM versions of busybox and whatnot do
  exist but they are very experimental. We don't actually need a fully
  functional linux environment, and there are apparently large outstanding
  problems with getting linux to build for WASM (longjmp something something),
  so I don't think it's worth messing with this. Also, start up time is abysmal.
- **Lua:** This is sort of the ideal embedded language, but...
  - Everyone knows python and no one knows lua.
  - There are multiple ports to the browser. It's not clear to me which to use.
  - You absolutely need to do things like zip/unzip files and whatnot. Python
    is more batteries-included, as opposed to needing to reimplement basic stuff
    for the sandboxed environment.
