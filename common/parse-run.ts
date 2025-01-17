import { pArr, pInst, pNum, pRec, pStr, pObjWithProps, pOpt, pTuple, pStrUnion, pBool, ObjPath, pTaggedUnion, pStrLit } from './parse';
import { pFiolinFormComponentId } from './parse-form';
import { FiolinLogLevel, FiolinRunRequest, FiolinRunResponse, FormUpdate } from './types';

export const pFiolinRunRequest = pObjWithProps<FiolinRunRequest>({
  inputs: pArr(pInst(File)),
  args: pOpt(pRec(pStr)),
});

export const pLogEntry = pTuple<[FiolinLogLevel, string]>([
  pStrUnion<FiolinLogLevel[]>(['DEBUG', 'INFO', 'WARN', 'ERROR']),
  pStr,
]);

export function pFormUpdate(p: ObjPath, v: unknown): FormUpdate {
  return pTaggedUnion<FormUpdate>({
    'HIDDEN': pObjWithProps({
      type: pStrLit('HIDDEN'),
      id: pFiolinFormComponentId,
      value: pBool,
    }),
    'DISABLED': pObjWithProps({
      type: pStrLit('DISABLED'),
      id: pFiolinFormComponentId,
      value: pBool,
    }),
    'FOCUS': pObjWithProps({
      type: pStrLit('FOCUS'),
      id: pFiolinFormComponentId,
    }),
  })(p, v);
};

export const pFiolinRunResponse = pObjWithProps<FiolinRunResponse>({
  outputs: pArr(pInst(File)),
  log: pArr(pLogEntry),
  error: pOpt(pInst(Error)),
  lineno: pOpt(pNum),
  partial: pOpt(pBool),
  formUpdates: pOpt(pArr(pFormUpdate)),
});
