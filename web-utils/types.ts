import { FiolinRunRequest, FiolinRunResponse, FiolinScript } from "../common/types";

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
  script: FiolinScript;
  request: FiolinRunRequest;
}

export interface SuccessMessage {
  type: 'SUCCESS';
  response: FiolinRunResponse;
}

export interface ErrorMessage {
  type: 'ERROR';
  error: Error;
  lineno?: number;
}
