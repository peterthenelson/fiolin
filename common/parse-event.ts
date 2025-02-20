import { pBool, pObjWithProps, pStrUnion, ObjPath, pTaggedUnion, pStrLit, pNum, pStr } from './parse';
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
      value: pStr,
      ...common,
    }),
    'POINTER': pObjWithProps({
      type: pStrLit('POINTER'),
      subtype: pStrUnion<typeof POINTER_EVENT_TYPES>(POINTER_EVENT_TYPES),
      altKey: pBool,
      ctrlKey: pBool,
      metaKey: pBool,
      shiftKey: pBool,
      button: pNum,
      buttons: pNum,
      clientX: pNum,
      clientY: pNum,
      movementX: pNum,
      movementY: pNum,
      offsetX: pNum,
      offsetY: pNum,
      pageX: pNum,
      pageY: pNum,
      screenX: pNum,
      screenY: pNum,
      ...common,
    }),
  })(p, v);
}
