import { ObjPath, pInst, pNum, pStr, pStrLit, pObjWithProps, pStrUnion, pOpt, pTaggedUnion, pRec } from '../common/parse';
import { pFiolinScript } from '../common/parse-script';
import { pFiolinRunRequest, pFiolinRunResponse } from '../common/parse-run';
import { ErrorMessage, InstallPackagesMessage, LoadedMessage, PackagesInstalledMessage, RunMessage, LogMessage, SuccessMessage, WorkerMessage, WorkerMessageType } from './types';
import { FiolinLogLevel } from '../common/types';

function getWindow() {
  try {
    return window;
  } catch (e) {
    try {
      return global;
    } catch (e) {
      return globalThis;
    }
  }
}

export function pWorkerMessage(p: ObjPath, v: unknown): WorkerMessage {
  return pTaggedUnion<WorkerMessage>({
    'LOADED': pLoadedMessage,
    'LOG': pLogMessage,
    'INSTALL_PACKAGES': pInstallPackagesMessage,
    'PACKAGES_INSTALLED': pPackagesInstalledMessage,
    'RUN': pRunMessage,
    'SUCCESS': pSuccessMessage,
    'ERROR': pErrorMessage,
  })(p, v);
}

export const pWorkerMessageType = pStrUnion<WorkerMessageType[]>([
  'LOADED',
  'LOG',
  'INSTALL_PACKAGES',
  'PACKAGES_INSTALLED',
  'RUN',
  'SUCCESS',
  'ERROR',
]);

export const pLoadedMessage = pObjWithProps<LoadedMessage>({
  type: pStrLit('LOADED')
});

const pLevel = pStrUnion<FiolinLogLevel[]>(['DEBUG', 'INFO', 'WARN', 'ERROR']);

export const pLogMessage = pObjWithProps<LogMessage>({
  type: pStrLit('LOG'),
  level: pLevel,
  value: pStr,
});

export const pInstallPackagesMessage = pObjWithProps<InstallPackagesMessage>({
  type: pStrLit('INSTALL_PACKAGES'),
  script: pFiolinScript,
});

export const pPackagesInstalledMessage = pObjWithProps<PackagesInstalledMessage>({
  type: pStrLit('PACKAGES_INSTALLED'),
});

export const pRunMessage = pObjWithProps<RunMessage>({
  type: pStrLit('RUN'),
  script: pFiolinScript,
  request: pFiolinRunRequest,
  setCanvases: pOpt(pRec<OffscreenCanvas>(pInst(getWindow().OffscreenCanvas))),
});

export const pSuccessMessage = pObjWithProps<SuccessMessage>({
  type: pStrLit('SUCCESS'),
  response: pFiolinRunResponse,
});

export function pErrorMessage(p: ObjPath, v: unknown) {
  const em = pObjWithProps<ErrorMessage>({
    type: pStrLit('ERROR'),
    error: pInst(Error),
    name: pStr,
    lineno: pOpt(pNum),
    response: pOpt(pFiolinRunResponse),
  })(p, v);
  if (em.name) {
    try {
      em.error.name = em.name;
    } catch (e) {
      console.error(`Failed to set name field of ${em.error} to ${em.name}`);
    }
  }
  return em;
}
