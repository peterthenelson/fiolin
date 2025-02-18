import { pObjWithProps, pStrUnion, ObjPath, pTaggedUnion, pStrLit, pNum } from './parse';
import { pFiolinFormComponentId } from './parse-form';
import { FiolinFormEvent, INPUT_EVENT_TYPES, POINTER_EVENT_TYPES } from './types';

const common = {
  target: pFiolinFormComponentId,
  timeStamp: pNum,
}

export function pFormEvent(p: ObjPath, v: unknown): FiolinFormEvent {
  return pTaggedUnion<FiolinFormEvent>({
    'INPUT': pObjWithProps({
      type: pStrLit('INPUT'),
      subtype: pStrUnion<typeof INPUT_EVENT_TYPES>(INPUT_EVENT_TYPES),
      ...common,
    }),
    'POINTER': pObjWithProps({
      type: pStrLit('POINTER'),
      subtype: pStrUnion<typeof POINTER_EVENT_TYPES>(POINTER_EVENT_TYPES),
      ...common,
    }),
  })(p, v);
}
