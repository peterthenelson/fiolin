import { pObj, ObjPath, pInst, pNum, pOnlyKeys, pProp, pPropU, pStr, pStrLit } from '../common/parse';
import { pFiolinScript } from '../common/parse-script';
import { pFiolinRunRequest, pFiolinRunResponse } from '../common/parse-run';
import { ErrorMessage, InstallPackagesMessage, LoadedMessage, PackagesInstalledMessage, RunMessage, LogMessage, SuccessMessage, WorkerMessage } from './types';
import { FiolinLogLevel } from '../common/types';

export function pWorkerMessage(p: ObjPath, v: unknown): WorkerMessage {
  const o: object = pObj(p, v);
  const type: string = pProp(p, o, 'type', pStr).type;
  if (type === 'LOADED') {
    return pLoadedMessage(p, v);
  } else if (type === 'LOG') {
    return pLogMessage(p, v);
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
    throw p.err(`to be a WorkerMessage with a known type; got type "${type}"`);
  }
}
  
export function pLoadedMessage(p: ObjPath, v: unknown): LoadedMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type']);
  return {
    ...pProp(p, o, 'type', pStrLit('LOADED')),
  };
}

function pLevel(p: ObjPath, v: unknown): FiolinLogLevel {
  if (v === 'DEBUG' || v === 'INFO' || v === 'WARN' || v === 'ERROR') return v;
  throw p.err(`be DEBUG/INFO/WARN/ERROR, got ${v}`);
}

export function pLogMessage(p: ObjPath, v: unknown): LogMessage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'level', 'value']);
  return {
    ...pProp(p, o, 'type', pStrLit('LOG')),
    ...pProp(p, o, 'level', pLevel),
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
  pOnlyKeys(p, o, ['type', 'error', 'name', 'lineno']);
  const em = {
    ...pProp(p, o, 'type', pStrLit('ERROR')),
    ...pProp(p, o, 'error', pInst(Error)),
    ...pProp(p, o, 'name', pStr),
    ...pPropU(p, o, 'lineno', pNum),
  };
  if (em.name) {
    try {
      em.error.name = em.name;
    } catch (e) {
      console.error(`Failed to set name field of ${em.error} to ${em.name}`);
    }
  }
  return em;
}
