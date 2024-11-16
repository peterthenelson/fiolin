import { pArr, ObjPath, pInst, pNum, pOnlyKeys, pProp, pPropU, pStr, pObj } from './parse';
import { FiolinRunRequest, FiolinRunResponse } from './types';

export function pFiolinRunRequest(p: ObjPath, v: unknown): FiolinRunRequest {
  const o: Object = pObj(p, v);
  pOnlyKeys(p, o, ['inputs', 'argv']);
  return {
    ...pProp(p, o, 'inputs', pArr(pInst(File))),
    ...pProp(p, o, 'argv', pStr),
  };
}

export function pFiolinRunResponse(p: ObjPath, v: unknown): FiolinRunResponse {
  const o: Object = pObj(p, v);
  pOnlyKeys(p, o, ['outputs', 'stdout', 'stderr', 'error', 'lineno']);
  return {
    ...pProp(p, o, 'outputs', pArr(pInst(File))),
    ...pProp(p, o, 'stdout', pStr),
    ...pProp(p, o, 'stderr', pStr),
    ...pPropU(p, o, 'error', pInst(Error)),
    ...pPropU(p, o, 'lineno', pNum),
  };
}
