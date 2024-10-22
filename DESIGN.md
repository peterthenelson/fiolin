# Fiolin

_Fiddle with Files_

## Motivation and Overview

TODO:
- Windows and Mac are increasingly [walled gardens](https://en.wikipedia.org/wiki/Closed_platform).
- Technical users benefit from open source but can't easily share software with
  their non-technical friends and relatives.
- The web is perfect for sharing amateur software, but only if it's javascript
- There are a million scammy websites to convert a file from one format to
  another; most of this functionality could be done within your own browser
  with imagemagick or some other command-line tool like that. It's a pretty
  broad category of software that would be nice to be easily shared.
- Wouldn't it be nice to have jsfiddle but for shell scripts? Just knock
  something together in a few minutes and share it with your non-technical
  friends?

## Design

TODO:
- Wrapper page that lets you "upload" a file or files and download the results
- Pyodide for running the script itself, run in a sandbox "file system"
- WASM versions of common cli utilties working in the same "file system"
- Third-party scripts can be hosted as a json file on github pages or some other
  CDN (that supports CORS anyways).

## Sandboxing

Fiolin is intended to allow for two classes of users to interact safely:
- Developers should be able to write arbitrary scripts that operate over a
  given file or directory and either print to stdout or create output files.
- Users should be able to interact with these scripts without fear that the
  files they choose will be exfiltrated. Computation should be entirely local,
  and no network requests whatsoever should be sent to developer-chosen servers.

### WASM

WASM itself provides an excellent sandbox for the code running in it. However,
emscripten can easily blow huge holes in the sandbox when, for example, you link
in support for sockets. The compiled artifacts include both the sandboxed WASM
and the (sandbox compromising) javascript glue code in a big unreadable bundle.
If I want to provide a build-chain that provides the sort of security guarantees
I'm interested in, I'll probably need to muck around with emscripten.

### Pyodide

My basic opinion is that pyodide is not all that well sandboxed, but we can take
a couple measures to mitigate that:

- Put pyodide in a web worker and intialize it with a custom `options.jsglobals`
  in order to remove any _obvious_ unapproved ways for the script to interact
  with the browser. Now, I personally can't think of any _non-obvious_
  unapproved ways for the script to interact with `window`, but I wouldn't bet
  my life on it.
- Network exfiltration via `fetch` remains a concern even if the above approach
  is working. We can use a CSP to limit what resources can be loaded (via fetch
  or any other mechanism), as well as other problematic behavior, such as forced
  navigation or hidden iframes. So if a pyodide breakout occurs, it should be
  limited to just messing up the current tab.

### CSP

- CSPs can be specified with headers or with a <meta> tag, which I'd like to use
  if I can avoid having to run a web-server myself. We'll see anyways.
- The most directly relevant types of directives are `connect-src`, `script-src`,
  and `worker-src`, but honestly any type of inclusion could result in data
  exfiltration.
- It's possible to limit script sources to particular domains or even to files
  with particular hashes. However, it's unfortunately the case that wasm is
  currently all (`wasm-unsafe-eval`) or nothing. This is, however, orthogonal to
  the ability to fetch stuff to begin with, so it doesn't open up any new
  exfiltration concerns.
- In practice, I probably want a policy that defaults to `'self'` and then opens
  up `script-src` to wasm and wherever the pyodide scripts are hosted:
  ```html
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'wasm-unsafe-eval' https://foo.bar; "
  />
  ```

TODO: Figure out how CSPs work for web-workers and iframes and see if I can/need
to break my app up into multiple parts with different CSPs.

## Alternatives Considered

TODO:
- Desktop app of any kind: too high friction for users to require an install.
- Actual shell scripts in browser: WASM versions of busybox and whatnot do exist
  but they are very experimental. We don't actually need a fully functional
  linux environment, and there are apparently large outstanding problems with
  getting linux to build for WASM (longjmp / "zero-cost exception handling"), so
  I don't think it's worth messing with this.
- Lua: This is sort of the ideal embedded language, but
  - Everyone knows python and no one knows lua
  - There are multiple ports to the browser; not clear to me which to use
  - You absolutely need to do things like zip/unzip files and whatnot; python
    is more batteries-included, as opposed to needing to reimplement basic stuff
    for the sandboxed environment
