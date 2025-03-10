# Fiolin Script Type Definitions

## FiolinScript

> The JSON format that defines a fiolin script. This is the object type meant
to be served on your github.io site.

**meta**: _FiolinScriptMeta_

> Metadata (some user-visible).

**interface**: _FiolinScriptInterface_

> Defines the UI and IO for the script.

**runtime**: _FiolinScriptRuntime_

> Defines the python/wasm setup for the script.

**code**: _FiolinScriptCode_

> The actual script to run.

## FiolinScriptMeta

> Metadata about your fiolin script.

**title**: _string_

> The human-readable title presented to the user. Preferably shorter than 50
characters long.

**description**: _string_

> The human-readable description presented to the user. Preferably should fit
in 80 columns and 5 lines.

**author?**: _string_

> Optional: the author's (or authoring organization's) name. The 3p interface
for fiolin will present the github profile badge of the repository hosting
the script rather the contents of this field, but filling it in helps to
keep track of the provenance in cases of forks.

**extensions?**: _string[]_

> Optional: the file extensions that this script is most appropriate for use
with. Doesn't affect the actual operation of the script but is used in 1p
fiolin for autocomplete and other UI hints.

## FILE_ARITIES = ['NONE', 'SINGLE', 'MULTI', 'ANY'] as

> An array with the valid values for FileArity.

## FileArity = (typeof

> The arity of file (input or output) for a script.

## TERMINAL_MODES = ['FATAL_ONLY', 'TEXT',

> An array with the valid values for TerminalMode.

## TerminalMode = (typeof

> The mode for the terminal UI. FATAL_ONLY will hide it by default, displaying
only when a fatal error happens. TEXT shows stdout (= INFO) and stderr
(= ERROR) logs as colored text, similar to a terminal. The LOG view shows
detailed logs in a structured way.

## FiolinScriptInterface

> How the fiolin UI is meant to communicate with the embedded script.

**inputFiles**: _FileArity_

> Does the script take 0, 1, >1, or any number of files as input?

**inputAccept?**: _string_

> What file types should the file input control accept?
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers

**outputFiles**: _FileArity_

> Does the script produce 0, 1, >1, or any number of files as output?

**form?**: _FiolinForm_

> Form presented to the user (the submitted values show up as args in the
FiolinRunRequest).

**terminal?**: _TerminalMode_

> The default behavior of the terminal. Defaults to TEXT.

## FiolinScriptRuntime

> How the fiolin runner is meant to setup the environment for the script.
By default, it runs pyodide and sets up libraries based on import statements.

**pythonPkgs?**: _FiolinPyPackage[]_

> External python packages that must be installed for the script to run.

**wasmModules?**: _FiolinWasmModule[]_

> Wasm-based dependencies (that are included with fiolin).

## FiolinPyPackage

> A python package required by the script to run.

**type**: _'PYPI'_

> The type of python package (currently can only be PYPI).

**name**: _string_

> The name of the python package.

## FiolinWasmModule

> A wasm module and associated js code. The available modules can be seen in
../../utils/loaders.ts and ../../web-utils/loaders.ts.

**name**: _string_

> The name of the wasm module (see the loaders for supported values).

## FiolinScriptCode

> The actual script to run. Currently just a string with python, but leaving it
as an object in case I want to give multiple options or extend it.

**python**: _string_

> Python script contents.

