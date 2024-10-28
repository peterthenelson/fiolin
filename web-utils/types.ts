export type WorkerMessage = (
  LoadedMessage | StdoutMessage | StderrMessage | RunMessage | SuccessMessage |
  ErrorMessage
);

export interface LoadedMessage { type: 'LOADED' }

export interface StdoutMessage {
  type: 'STDOUT';
  value: string;
}

export interface StderrMessage {
  type: 'STDERR';
  value: string;
}

export interface RunMessage {
  type: 'RUN';
  file?: File;
  script: string;
}

export interface SuccessMessage {
  type: 'SUCCESS';
  file?: Blob;
  fileName?: string;
}

export interface ErrorMessage {
  type: 'ERROR';
  error: Error;
}
