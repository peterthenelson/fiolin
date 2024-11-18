import { pObj, ObjPath, pInst, pNum, pOnlyKeys, pProp, pPropU, pStr, pStrLit } from '../common/parse';
import { pFiolinScript } from '../common/parse-script';
import { pFiolinRunRequest, pFiolinRunResponse } from '../common/parse-run';
import { ErrorMessage, InstallPackagesMessage, LoadedMessage, PackagesInstalledMessage, RunMessage, StderrMessage, StdoutMessage, SuccessMessage, WorkerMessage } from './types';

export function pWorkerMessage(p: ObjPath, v: unknown): WorkerMessage {
  const o: object = pObj(p, v);
  const type: string = pProp(p, o, 'type', pStr).type;
  if (type === 'LOADED') {
    return pLoadedMessage(p, v);
  } else if (type === 'STDOUT') {
    return pStdoutMessage(p, v);
  } else if (type === 'STDERR') {
    return pStderrMessage(p, v);
  } else if (type === 'INSTALL_PACKAGES') {
    return pInstallPackagesMessage(p, v);
  } else if (type === 'PACKAGES_INSTALLED') {
    return pPackagesInstalledMessage(p, v);
  } else if (type === 'RUN') {
    return pRunMessage(p, v);
  } else if (type === 'SUCCESS') {
    return pSuccessMessage(p, v);
  } else if (type === 'ERROR') {
    return pErrorMessage(p, v);
  } else {
    throw new Error(`Expected WorkerMessage to have a known type; got ${type}`);
  }
}
  
export function pLoadedMessage(p: ObjPath, v: unknown): LoadedMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type']);
  return {
    ...pProp(p, o, 'type', pStrLit('LOADED')),
  };
}

export function pStdoutMessage(p: ObjPath, v: unknown): StdoutMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'value']);
  return {
    ...pProp(p, o, 'type', pStrLit('STDOUT')),
    ...pProp(p, o, 'value', pStr),
  };
}

export function pStderrMessage(p: ObjPath, v: unknown): StderrMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'value']);
  return {
    ...pProp(p, o, 'type', pStrLit('STDERR')),
    ...pProp(p, o, 'value', pStr),
  };
}

export function pInstallPackagesMessage(p: ObjPath, v: unknown): InstallPackagesMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'script']);
  return {
    ...pProp(p, o, 'type', pStrLit('INSTALL_PACKAGES')),
    ...pProp(p, o, 'script', pFiolinScript),
  };
}

export function pPackagesInstalledMessage(p: ObjPath, v: unknown): PackagesInstalledMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type']);
  return {
    ...pProp(p, o, 'type', pStrLit('PACKAGES_INSTALLED')),
  };
}

export function pRunMessage(p: ObjPath, v: unknown): RunMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'script', 'request']);
  return {
    ...pProp(p, o, 'type', pStrLit('RUN')),
    ...pProp(p, o, 'script', pFiolinScript),
    ...pProp(p, o, 'request', pFiolinRunRequest),
  };
}

export function pSuccessMessage(p: ObjPath, v: unknown): SuccessMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'response']);
  return {
    ...pProp(p, o, 'type', pStrLit('SUCCESS')),
    ...pProp(p, o, 'response', pFiolinRunResponse),
  };
}

export function pErrorMessage(p: ObjPath, v: unknown): ErrorMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'error', 'lineno']);
  return {
    ...pProp(p, o, 'type', pStrLit('ERROR')),
    ...pProp(p, o, 'error', pInst(Error)),
    ...pPropU(p, o, 'lineno', pNum),
  };
}
