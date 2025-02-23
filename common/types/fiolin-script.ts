import { FiolinForm } from './form';

// The JSON format that defines a fiolin script. This is the object type meant
// to be served on your github.io site.
export interface FiolinScript {
  // Metadata (some user-visible).
  meta: FiolinScriptMeta;
  // Defines the UI and IO for the script.
  interface: FiolinScriptInterface;
  // Defines the python/wasm setup for the script.
  runtime: FiolinScriptRuntime;
  // The actual script to run.
  code: FiolinScriptCode;
}

// Metadata about your fiolin script.
export interface FiolinScriptMeta {
  // The human-readable title presented to the user. Preferably shorter than 50
  // characters long.
  title: string;
  // The human-readable description presented to the user. Preferably should fit
  // in 80 columns and 5 lines.
  description: string;
  // Optional: the author's (or authoring organization's) name. The 3p interface
  // for fiolin will present the github profile badge of the repository hosting
  // the script rather the contents of this field, but filling it in helps to
  // keep track of the provenance in cases of forks.
  author?: string;
  // Optional: the file extensions that this script is most appropriate for use
  // with. Doesn't affect the actual operation of the script but is used in 1p
  // fiolin for autocomplete and other UI hints.
  extensions?: string[];
}

// An array with the valid values for FileArity.
export const FILE_ARITIES = ['NONE', 'SINGLE', 'MULTI', 'ANY'] as const;

// The arity of file (input or output) for a script.
export type FileArity = (typeof FILE_ARITIES)[number];

// How the fiolin UI is meant to communicate with the embedded script.
export interface FiolinScriptInterface {
  // Does the script take 0, 1, >1, or any number of files as input?
  inputFiles: FileArity;
  // What file types should the file input control accept?
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
  inputAccept?: string;
  // Does the script produce 0, 1, >1, or any number of files as output?
  outputFiles: FileArity;
  // Form presented to the user (the submitted values show up as args in the
  // FiolinRunRequest).
  form?: FiolinForm;
  // TODO: extend w/stuff about console output
}

// How the fiolin runner is meant to setup the environment for the script.
// By default, it runs pyodide and sets up libraries based on import statements.
export interface FiolinScriptRuntime {
  // External python packages that must be installed for the script to run.
  pythonPkgs?: FiolinPyPackage[];
  // Wasm-based dependencies (that are included with fiolin).
  wasmModules?: FiolinWasmModule[];
}

// A python package required by the script to run.
export interface FiolinPyPackage {
  // The type of python package (currently can only be PYPI).
  type: 'PYPI';
  // The name of the python package.
  name: string;
}

// A wasm module and associated js code. The available modules can be seen in
// ../../utils/loaders.ts and ../../web-utils/loaders.ts.
export interface FiolinWasmModule {
  // The name of the wasm module (see the loaders for supported values).
  name: string;
}

// The actual script to run. Currently just a string with python, but leaving it
// as an object in case I want to give multiple options or extend it.
export interface FiolinScriptCode {
  // Python script contents.
  python: string;
}
