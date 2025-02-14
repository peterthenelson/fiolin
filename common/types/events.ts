import { ExtractTagType  } from '../tagged-unions';

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

// Pointer event names
export type FiolinFormPointerEventType = (
  'pointerdown' | 'pointerup' | 'pointermove' |
  'pointerover' | 'pointerout' | 'pointerenter' | 'pointerleave' |
  'pointercancel' | 'gotpointercapture' | 'lostpointercapture'
);

// Pointer event (includes all mouse and touchpad events)
export interface FiolinFormPointerEvent {
  // Type tag
  type: 'POINTER';
  // The name of the specific pointer event
  subtype: FiolinFormPointerEventType;
  // TODO
}

// Input event names
export type FiolinFormInputEventType = 'input' | 'change';

// Input event (includes oninput and onchange)
export interface FiolinFormInputEvent {
  // Type tag
  type: 'INPUT';
  // The name of the specific input event
  subtype: FiolinFormInputEventType;
  // TODO
}
