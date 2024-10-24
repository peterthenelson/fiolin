This is very partial; I have a running notes google doc that has more stuff, but
these are more concrete programming tasks:

- Move script to a worker (also unsure how CSPs interact with that and if so, if
  there's any advantage to making it a worker within a child frame). I think I
  need to migrate to WORKERFS or something if that's the case? Maybe?
- Make a ppt-unlocking script that actually works w/in the setup.
- Get some other emscripten binary working in the same file-system as pyodide.
- Set up flask or some web server and make it serve w/CSPs and whatnot to make
  sure all the wiring works (and unintented wiring doesn't!).
- Set up tests involving the web server and selenium or something along those
  lines.
- Set up the CORS fetch so that scripts are being loaded from other files.
