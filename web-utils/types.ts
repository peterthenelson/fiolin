import { FiolinLogLevel, FiolinRunRequest, FiolinRunResponse, FiolinScript } from '../common/types';

export type WorkerMessage = (
  LoadedMessage | LogMessage | InstallPackagesMessage |
  PackagesInstalledMessage | RunMessage | SuccessMessage | ErrorMessage
);

export interface LoadedMessage { type: 'LOADED' }

export interface LogMessage {
  type: 'LOG';
  level: FiolinLogLevel;
  value: string;
}

export interface InstallPackagesMessage {
  type: 'INSTALL_PACKAGES';
  script: FiolinScript;
}

export interface PackagesInstalledMessage { type: 'PACKAGES_INSTALLED' }

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
