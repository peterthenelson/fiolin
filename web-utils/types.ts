import { FiolinLogLevel, FiolinRunRequest, FiolinRunResponse, FiolinScript } from '../common/types';
import { toErr } from '../common/errors';

export type WorkerMessage = (
  LoadedMessage | LogMessage | InstallPackagesMessage |
  PackagesInstalledMessage | RunMessage | SuccessMessage | ErrorMessage
);

export type WorkerMessageType = WorkerMessage extends { type: infer T } ? T : never;

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
  name?: string;
  lineno?: number;
}

export function mkErrorMessage(e: unknown, lineno?: number): ErrorMessage {
  const em: ErrorMessage = { type: 'ERROR', error: toErr(e), lineno };
  em.name = em.error.name;
  return em;
}
