import { pObjWithProps, pStrUnion, ObjPath, pTaggedUnion, pStrLit } from './parse';
import { FiolinFormEvent, INPUT_EVENT_TYPES, POINTER_EVENT_TYPES } from './types';

export function pFormEvent(p: ObjPath, v: unknown): FiolinFormEvent {
  return pTaggedUnion<FiolinFormEvent>({
    'INPUT': pObjWithProps({
      type: pStrLit('INPUT'),
      subtype: pStrUnion<typeof INPUT_EVENT_TYPES>(INPUT_EVENT_TYPES),
    }),
    'POINTER': pObjWithProps({
      type: pStrLit('POINTER'),
      subtype: pStrUnion<typeof POINTER_EVENT_TYPES>(POINTER_EVENT_TYPES),
    }),
  })(p, v);
}
