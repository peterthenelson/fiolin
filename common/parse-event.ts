import { pObjWithProps, pStrUnion, ObjPath, pTaggedUnion, pStrLit } from './parse';
import { FiolinFormEvent } from './types';

export function pFormEvent(p: ObjPath, v: unknown): FiolinFormEvent {
  return pTaggedUnion<FiolinFormEvent>({
    'INPUT': pObjWithProps({
      type: pStrLit('INPUT'),
      subtype: pStrUnion<['input', 'change']>(['input', 'change']),
    }),
    'POINTER': pObjWithProps({
      type: pStrLit('POINTER'),
      subtype: pStrUnion<[
        'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout',
        'pointerenter', 'pointerleave', 'pointercancel', 'gotpointercapture',
        'lostpointercapture', 'click'
      ]>([
        'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout',
        'pointerenter', 'pointerleave', 'pointercancel', 'gotpointercapture',
        'lostpointercapture', 'click'
      ]),
    }),
  })(p, v);
}
