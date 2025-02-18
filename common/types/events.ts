import { ExtractTagType  } from '../tagged-unions';
import { FiolinFormComponentId } from './form';

// Event type pairs. Mostly used by utility code, but it's more
// helpful for this to be the canonical listing and have FiolinFormEvent be
// infered.
export type FiolinFormEventPair = (
  [FiolinFormPointerEvent, PointerEvent] | [FiolinFormInputEvent, InputEvent]
);

// Type assertion helper
type _Extends<T extends U, U> = true;

// Type assertion that second part of FiolinFormEventPair extends UIEvent
type _PairsHaveUIEvents = _Extends<FiolinFormEventPair extends [any, infer T] ? T : never, UIEvent>;

// Union type of all the form events
export type FiolinFormEvent = FiolinFormEventPair extends [infer T, any] ? T : never;

// The type tags for events
export type FiolinFormEventType = ExtractTagType<FiolinFormEvent>;

interface EventCommon {
  target: FiolinFormComponentId;
  timeStamp: number;
}

// The pointer event names as a value. Mostly useful for utility code, but it's
// possible to derive the type from this and not the other way around.
export const POINTER_EVENT_TYPES = [
  'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout',
  'pointerenter', 'pointerleave', 'pointercancel', 'gotpointercapture',
  'lostpointercapture', 'click'
] as const;

// Pointer event names
export type FiolinFormPointerEventType = (typeof POINTER_EVENT_TYPES)[number];

// Pointer event (includes all mouse and touchpad events)
export interface FiolinFormPointerEvent extends EventCommon {
  // Type tag
  type: 'POINTER';
  // The name of the specific pointer event
  subtype: FiolinFormPointerEventType;
  // TODO
}

/*
TODO: Consider these events
beforeinput
beforetoggle, toggle
cancel
various drag and drop
blur, focus, focusin, focusout
keydown,keypress,keyup
wheel
*/

// The input event names as a value. Mostly useful for utility code, but it's
// possible to derive the type from this and not the other way around.
export const INPUT_EVENT_TYPES = ['input', 'change'] as const;

// Input event names
export type FiolinFormInputEventType = (typeof INPUT_EVENT_TYPES)[number];

// Input event (includes oninput and onchange)
export interface FiolinFormInputEvent extends EventCommon {
  // Type tag
  type: 'INPUT';
  // The name of the specific input event
  subtype: FiolinFormInputEventType;
  // TODO
}
