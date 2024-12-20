import { pArr, ObjPath, pInst, pNum, pOnlyKeys, pProp, pPropU, pStr, pObj } from './parse';
import { FiolinLogLevel, FiolinRunRequest, FiolinRunResponse } from './types';

export function pFiolinRunRequest(p: ObjPath, v: unknown): FiolinRunRequest {
  const o: Object = pObj(p, v);
  pOnlyKeys(p, o, ['inputs', 'argv']);
  return {
    ...pProp(p, o, 'inputs', pArr(pInst(File))),
    ...pProp(p, o, 'argv', pStr),
  };
}

function pLogEntry(p: ObjPath, v: unknown): [FiolinLogLevel, string] {
  if (!Array.isArray(v) || v.length !== 2 || typeof v[1] !== 'string') throw p.err(`be a tuple of [FiolinLogLevel, string], got ${v}`);
  if (v[0] === 'DEBUG' || v[0] === 'INFO' || v[0] === 'WARN' || v[0] === 'ERROR') return [v[0], v[1]];
  throw p.err(`be a tuple of [FiolinLogLevel, string], but first entry was ${v[0]}`);
}

export function pFiolinRunResponse(p: ObjPath, v: unknown): FiolinRunResponse {
  const o: Object = pObj(p, v);
  pOnlyKeys(p, o, ['outputs', 'log', 'error', 'lineno']);
  return {
    ...pProp(p, o, 'outputs', pArr(pInst(File))),
    ...pProp(p, o, 'log', pArr(pLogEntry)),
    ...pPropU(p, o, 'error', pInst(Error)),
    ...pPropU(p, o, 'lineno', pNum),
  };
}
