import { pArr, pInst, pNum, pRec, pStr, pObjWithProps, pOpt, pTuple, pStrUnion, pBool, ObjPath, pTaggedUnion, pStrLit } from './parse';
import { pFormEvent } from './parse-event';
import { pFiolinFormComponentId, pPartialFiolinFormComponent } from './parse-form';
import { FiolinLogLevel, FiolinRunRequest, FiolinRunResponse, FormUpdate, ICanvasRenderingContext2D } from './types';

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

function pCanvas2D(p: ObjPath, v: unknown): ICanvasRenderingContext2D {
  if (v instanceof getWindow().CanvasRenderingContext2D) {
    return v;
  } else if (v instanceof getWindow().OffscreenCanvasRenderingContext2D) {
    return v;
  }
  throw p.err(`be a CanvasRenderingContext2D or offscreen equivalent; other implementations can't be parsed`);
}

export const pFiolinRunRequest = pObjWithProps<FiolinRunRequest>({
  inputs: pArr(pInst(File)),
  args: pOpt(pRec(pStr)),
  canvases: pOpt(pRec<ICanvasRenderingContext2D>(pCanvas2D)),
  event: pOpt(pFormEvent),
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
    'VALUE': pObjWithProps({
      type: pStrLit('VALUE'),
      id: pFiolinFormComponentId,
      value: pStr,
    }),
    'FOCUS': pObjWithProps({
      type: pStrLit('FOCUS'),
      id: pFiolinFormComponentId,
    }),
    'PARTIAL': pObjWithProps({
      type: pStrLit('PARTIAL'),
      id: pFiolinFormComponentId,
      value: pPartialFiolinFormComponent,
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
