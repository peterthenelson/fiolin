import { pArr, pInst, pNum, pRec, pStr, pObjWithProps, pOpt, pTuple, pStrUnion, pBool } from './parse';
import { FiolinLogLevel, FiolinRunRequest, FiolinRunResponse } from './types';

export const pFiolinRunRequest = pObjWithProps<FiolinRunRequest>({
  inputs: pArr(pInst(File)),
  args: pOpt(pRec(pStr)),
});

const pLogEntry = pTuple<[FiolinLogLevel, string]>([
  pStrUnion<FiolinLogLevel[]>(['DEBUG', 'INFO', 'WARN', 'ERROR']),
  pStr,
]);

export const pFiolinRunResponse = pObjWithProps<FiolinRunResponse>({
  outputs: pArr(pInst(File)),
  log: pArr(pLogEntry),
  error: pOpt(pInst(Error)),
  lineno: pOpt(pNum),
  partial: pOpt(pBool),
});
