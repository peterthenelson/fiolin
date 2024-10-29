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

// How the fiolin UI is meant to communicate with the embedded script.
export interface FiolinScriptInterface {
  // Does the script take 0, 1, or >=1 files as input?
  inputFiles: 'NONE' | 'SINGLE' | 'MULTI';
  // Does the script produce 0, 1, or >=1 files as input?
  outputFiles: 'NONE' | 'SINGLE' | 'MULTI';
  // TODO: extend w/stuff about flags, console output, and/or canvas
}

// How the fiolin runner is meant to setup the environment for the script.
// By default, it runs pyodide and sets up libraries based on import statements.
export interface FiolinScriptRuntime {
  // TODO: extend w/stuff about wasm, utilities, libraries, etc.
}

// The actual script to run. Currently just a string with python, but leaving it
// as an object in case I want to give multiple options or extend it.
export interface FiolinScriptCode {
  // Python script contents.
  python: string;
}

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

// Used internally to allow putting the python in a separate file.
export type FiolinScriptTemplate = Omit<FiolinScript, 'code'>;

// Used for encapsulating running a script (either for use w/run-fiolin or for
// the testing framework).
export interface FiolinRunRequest {
  inputs: string[];
  argv: string;
  outputDir: string;
}

export interface FiolinRunResponse {
  outputs: string[];
  stdout: string;
  stderr: string;
  error?: Error;
}

export interface FiolinJsGlobal {
  inFileName: string | null;
  outFileName: string | null;
  argv: string | null;
}

export interface FiolinRunner {
  run(request: FiolinRunRequest, onComplete: (response: FiolinRunResponse) => void): Promise<void>;
}

// Used for testing the scripts that ship w/Fiolin itself.
// TODO: Make this work properly with jest or something.
export type FiolinTest = (runner: FiolinRunner) => boolean
