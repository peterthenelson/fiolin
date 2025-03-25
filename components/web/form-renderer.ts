import { typeSwitch } from '../../common/tagged-unions';
import { FiolinFormEvent, FiolinFormInputEventType, FiolinFormPointerEventType, FiolinFormPointerType, FiolinScriptInterface, FormUpdate, INPUT_EVENT_TYPES, POINTER_EVENT_TYPES } from '../../common/types';
import { FiolinFormComponentMapImpl, idToRepr, makeId, maybeComponentToId, swapToPartial } from '../../common/form-utils';
import { FiolinFormComponent, FiolinFormComponentElement, FiolinFormComponentId, FiolinFormPartialComponentElement } from '../../common/types/form';
import { setSelected } from '../../web-utils/set-selected';

export type FormEventHandler = (id: FiolinFormComponentId, ev: FiolinFormEvent) => void;

interface RenderState {
  document: Document;
  form: HTMLFormElement;
  ui: FiolinScriptInterface;
  uniquelyIdentifiedElems: FiolinFormComponentMapImpl<FiolinFormComponentElement>;
  onEvent?: FormEventHandler;
}

export class RenderedForm {
  private readonly state: RenderState;

  private constructor(form: HTMLFormElement, ui: FiolinScriptInterface, onEvent?: FormEventHandler, document?: Document) {
    this.state = {
      document: document || window.document,
      form,
      ui,
      uniquelyIdentifiedElems: new FiolinFormComponentMapImpl(),
      onEvent,
    }
  }

  get form(): HTMLFormElement {
    return this.state.form;
  }

  get(id: FiolinFormComponentId): FiolinFormComponentElement | undefined {
    return this.state.uniquelyIdentifiedElems.get(id);
  }

  static render(form: HTMLFormElement, ui?: FiolinScriptInterface, onEvent?: FormEventHandler, document?: Document): RenderedForm {
    ui ||= { inputFiles: 'ANY', outputFiles: 'ANY' };
    const rendered = new RenderedForm(form, ui, onEvent, document);
    form.onsubmit = () => {};
    const newChildren: HTMLElement[] = [];
    if (!ui.form) {
      form.replaceChildren(...newChildren);
      return rendered;
    }
    for (const c of ui.form.children) {
      newChildren.push(renderComponent(c, rendered.state)[1]);
    }
    if (ui.form.autofocusedName) {
      const id = makeId(ui.form.autofocusedName, ui.form.autofocusedValue);
      const ce = rendered.get(id);
      if (ce) {
        ce[1].autofocus = true;
      } else {
        throw new Error(`Could not find element to autofocus (${idToRepr(id)})`);
      }
    }
    form.replaceChildren(...newChildren);
    return rendered;
  }

  applyUpdate(formUpdate: FormUpdate) {
    const ce = this.get(formUpdate.id);
    if (!ce) {
      throw new Error(`Cannot find element with ${idToRepr(formUpdate.id)}`);
    }
    typeSwitch(formUpdate, {
      'HIDDEN': (fu) => {
        if (fu.value) {
          ce[1].classList.add('hidden');
        } else {
          ce[1].classList.remove('hidden');
        }
      },
      'DISABLED': (fu) => {
        if (ce[1] instanceof HTMLInputElement || ce[1] instanceof HTMLSelectElement || ce[1] instanceof HTMLButtonElement) {
          ce[1].disabled = fu.value;
        } else {
          console.warn(`${ce[1]} does not have have .disabled property`);
        }
      },
      'VALUE': (fu) => {
        if (ce[1] instanceof HTMLInputElement || ce[1] instanceof HTMLOutputElement || ce[1] instanceof HTMLButtonElement) {
          ce[1].value = fu.value;
        } else if (ce[1] instanceof HTMLSelectElement) {
          setSelected(ce[1], fu.value);
        } else {
          console.warn(`${ce[1]} does not have have .value property`);
        }
      },
      'FOCUS': () => {
        ce[1].focus();
      },
      'PARTIAL': (fu) => {
        const update = swapToPartial(ce, fu.value);
        renderInPlace(update, this.state, false, formUpdate.id);
      }
    })
  }

  transferCanvases(): Record<string, OffscreenCanvas> {
    const canvases: Record<string, OffscreenCanvas> = {};
    for (const [id, ce] of this.state.uniquelyIdentifiedElems) {
      if (ce[1] instanceof HTMLCanvasElement) {
        canvases[id.name] = ce[1].transferControlToOffscreen();
      }
    }
    return canvases;
  }
}

function createAndPairElement(document: Document, component: FiolinFormComponent): FiolinFormComponentElement {
  return typeSwitch(component, {
    'DIV': (c) => [c, document.createElement('div')],
    'LABEL': (c) => [c, document.createElement('label')],
    'CHECKBOX': (c) => [c, document.createElement('input')],
    'COLOR': (c) => [c, document.createElement('input')],
    'DATE': (c) => [c, document.createElement('input')],
    'DATETIME_LOCAL': (c) => [c, document.createElement('input')],
    'EMAIL': (c) => [c, document.createElement('input')],
    'FILE': (c) => [c, document.createElement('input')],
    'NUMBER': (c) => [c, document.createElement('input')],
    'RADIO': (c) => [c, document.createElement('input')],
    'RANGE': (c) => [c, document.createElement('input')],
    'TEL': (c) => [c, document.createElement('input')],
    'TEXT': (c) => [c, document.createElement('input')],
    'TIME': (c) => [c, document.createElement('input')],
    'URL': (c) => [c, document.createElement('input')],
    'SELECT': (c) => [c, document.createElement('select')],
    'BUTTON': (c) => [c, document.createElement('button')],
    'OUTPUT': (c) => [c, document.createElement('output')],
    'CANVAS': (c) => [c, document.createElement('canvas')],
  });
}

function ceSwitch<V>(input: FiolinFormPartialComponentElement, cases: { [K in FiolinFormPartialComponentElement[0]['type']]: (input: Extract<FiolinFormPartialComponentElement, [{ type: K }, any]>) => V }): V {
  for (const [k, val] of Object.entries(cases)) {
    if (k === input[0].type) {
      return (val as (input: unknown) => V)(input);
    }
  }
  throw new Error(`Expected input.type be one of ${Object.keys(cases).join(' | ')}; got ${input[0].type}`);
}

function updateField<T extends keyof any, U>(obj: Record<T, U>, key: T, value?: U) {
  if (value === undefined) return;
  obj[key] = value;
}

function updateFieldToStr<T extends keyof any, U>(obj: Record<T, string>, key: T, value?: U) {
  if (value === undefined || value === null) return;
  obj[key] = value.toString();
}

function ignore() {};

function extractPointer(ev: MouseEvent) {
  const {
    altKey, ctrlKey, metaKey, shiftKey, button, buttons,
    clientX, clientY, movementX, movementY, 
    offsetX, offsetY, pageX, pageY, screenX, screenY
  } = ev;
  const common = {
    altKey, ctrlKey, metaKey, shiftKey, button, buttons,
    clientX, clientY, movementX, movementY, 
    offsetX, offsetY, pageX, pageY, screenX, screenY
  };
  let pointerId = 0, pointerType: FiolinFormPointerType = 'mouse',
    isPrimary = true, height = 1, width = 1, pressure = buttons !== 0 ? 0.5 : 0,
    tangentialPressure = 0, altitudeAngle = Math.PI / 2, azimuthAngle = 0,
    tiltX = 0, tiltY = 0, twist = 0;
  if (ev instanceof PointerEvent) {
    pointerId = ev.pointerId;
    pointerType = (ev.pointerType as FiolinFormPointerType);
    isPrimary = ev.isPrimary;
    height = ev.height;
    width = ev.width;
    pressure = ev.pressure;
    tangentialPressure = ev.tangentialPressure;
    if ('altitudeAngle' in ev && typeof ev.altitudeAngle === 'number') {
      altitudeAngle = ev.altitudeAngle;
    }
    if ('azimuthAngle' in ev && typeof ev.azimuthAngle === 'number') {
      azimuthAngle = ev.azimuthAngle;
    }
    tiltX = ev.tiltX;
    tiltY = ev.tiltY;
    twist = ev.twist;
  }
  return { 
    pointerId, pointerType, isPrimary, height, width, pressure, tangentialPressure,
    altitudeAngle, azimuthAngle, tiltX, tiltY, twist, ...common,
  };
}

function transformEvent<E extends Event>(ev: E, target: FiolinFormComponentId): FiolinFormEvent | undefined {
  const common = { target, timeStamp: ev.timeStamp };
  if (ev instanceof InputEvent) {
    const i = INPUT_EVENT_TYPES.indexOf(ev.type as FiolinFormInputEventType);
    if (i !== -1) {
      const value = ev.target && 'value' in ev.target ? (ev.target.value || '').toString() : '';
      return { type: 'INPUT', subtype: INPUT_EVENT_TYPES[i], value, ...common };
    } else {
      throw new Error(`Unexpected input event subtype: ${ev.type}`);
    }
  } else if (ev instanceof PointerEvent) {
    const i = POINTER_EVENT_TYPES.indexOf(ev.type as FiolinFormPointerEventType);
    if (i !== -1) {
      return { type: 'POINTER', subtype: POINTER_EVENT_TYPES[i], ...extractPointer(ev), ...common };
    } else {
      throw new Error(`Unexpected pointer event subtype: ${ev.type}`);
    }
  } else if (ev instanceof MouseEvent) {
    if (ev.type === 'click' || ev.type === 'dblclick') {
      return { type: 'POINTER', subtype: ev.type, ...extractPointer(ev), ...common };
    } else {
      throw new Error(`Unexpected mouse event subtype: ${ev.type}`);
    }
  } else {
    if (ev.type === 'change' || ev.type === 'input') {
      const value = ev.target && 'value' in ev.target ? (ev.target.value || '').toString() : '';
      return { type: 'INPUT', subtype: ev.type, value, ...common };
    } else {
      throw new Error(`Unexpected event subtype: ${ev.type}`);
    }
  }
}

function forwardEvent<E extends Event>(id: FiolinFormComponentId, onEvent: FormEventHandler): (this: GlobalEventHandlers, ev: E) => any {
  return (ev: E) => {
    const t = transformEvent(ev, id);
    if (t) onEvent(id, t);
  }
}

function renderInPlace(ce: FiolinFormPartialComponentElement, state: RenderState, initial: boolean, id?: FiolinFormComponentId) {
  const document = state.document;
  ceSwitch(ce, {
    'DIV': ([component, div]) => {
      if (component.dir) div.classList.add(`flex-${component.dir.toLowerCase()}-wrap`);
      if (initial) {
        for (const c of (component.children || [])) {
          div.append(renderComponent(c, state)[1]);
        }
      } else if ((component.children || []).length > 0) {
        console.warn('Form update for div specifies children: ignoring');
      }
    },
    'LABEL': ([component, label]) => {
      if (initial) {
        label.append(component.text || '');
      } else if (component.text !== undefined) {
        label.firstChild!.textContent = component.text;
      }
      if (initial && component.child) {
        label.append(renderComponent(component.child, state)[1]);
      } else if (component.child) {
        console.warn('Form update for label specifies child: ignoring');
      }
    },
    'CHECKBOX': ([component, input]) => {
      input.type = 'checkbox';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'checked', component.checked);
      updateField(input, 'disabled', component.disabled);
    },
    'COLOR': ([component, input]) => {
      input.type = 'color';
      updateField(input, 'name', component.name);
      updateFieldToStr(input, 'value', component.value);
      updateField(input, 'disabled', component.disabled);
    },
    'DATE': ([component, input]) => {
      input.type = 'date';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'required', component.required);
      updateField(input, 'min', component.min);
      updateField(input, 'max', component.max);
      updateFieldToStr(input, 'step', component.step);
      updateField(input, 'disabled', component.disabled);
    },
    'DATETIME_LOCAL': ([component, input]) => {
      input.type = 'date';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'required', component.required);
      updateField(input, 'min', component.min);
      updateField(input, 'max', component.max);
      updateFieldToStr(input, 'step', component.step);
      updateField(input, 'disabled', component.disabled);
    },
    'EMAIL': ([component, input]) => {
      input.type = 'text';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'multiple', component.multiple);
      updateField(input, 'pattern', component.pattern);
      updateField(input, 'required', component.required);
      updateField(input, 'placeholder', component.placeholder);
      updateField(input, 'size', component.size);
      updateField(input, 'disabled', component.disabled);
    },
    'FILE': ([component, input]) => {
      // TODO: Don't just make an input. Make a little panel.
      input.type = 'file';
      updateField(input, 'name', component.name);
      updateField(input, 'multiple', component.multiple);
      const accept = component.accept || state.ui.inputAccept;
      if (accept) input.accept = accept;
      if (component.submit) {
        input.oncancel = () => {
          input.value = '';
          state.form.requestSubmit();
        }
        input.onchange = () => {
          // TODO: Update the text part
          state.form.requestSubmit();
          input.value = '';
        }
      }
      updateField(input, 'disabled', component.disabled);
    },
    'NUMBER': ([component, input]) => {
      input.type = 'number';
      updateField(input, 'name', component.name);
      updateFieldToStr(input, 'value', component.value);
      updateField(input, 'required', component.required);
      updateField(input, 'placeholder', component.placeholder);
      updateFieldToStr(input, 'min', component.min);
      updateFieldToStr(input, 'max', component.max);
      updateFieldToStr(input, 'step', component.step);
      updateField(input, 'disabled', component.disabled);
    },
    'RADIO': ([component, input]) => {
      input.type = 'radio';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'checked', component.checked);
      updateField(input, 'required', component.required);
      updateField(input, 'disabled', component.disabled);
    },
    'RANGE': ([component, input]) => {
      input.type = 'range';
      updateField(input, 'name', component.name);
      updateFieldToStr(input, 'value', component.value);
      updateFieldToStr(input, 'min', component.min);
      updateFieldToStr(input, 'max', component.max);
      updateFieldToStr(input, 'step', component.step);
      updateField(input, 'disabled', component.disabled);
    },
    'TEL': ([component, input]) => {
      input.type = 'tel';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'pattern', component.pattern);
      updateField(input, 'required', component.required);
      updateField(input, 'placeholder', component.placeholder);
      updateField(input, 'size', component.size);
      updateField(input, 'disabled', component.disabled);
    },
    'TEXT': ([component, input]) => {
      input.type = 'text';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'pattern', component.pattern);
      updateField(input, 'required', component.required);
      updateField(input, 'placeholder', component.placeholder);
      updateField(input, 'size', component.size);
      updateField(input, 'disabled', component.disabled);
    },
    'TIME': ([component, input]) => {
      input.type = 'time';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'required', component.required);
      updateField(input, 'min', component.min);
      updateField(input, 'max', component.max);
      updateFieldToStr(input, 'step', component.step);
      updateField(input, 'disabled', component.disabled);
    },
    'URL': ([component, input]) => {
      input.type = 'url';
      updateField(input, 'name', component.name);
      updateField(input, 'value', component.value);
      updateField(input, 'pattern', component.pattern);
      updateField(input, 'required', component.required);
      updateField(input, 'placeholder', component.placeholder);
      updateField(input, 'size', component.size);
      updateField(input, 'disabled', component.disabled);
    },
    'SELECT': ([component, select]) => {
      updateField(select, 'name', component.name);
      updateField(select, 'multiple', component.multiple);
      updateField(select, 'required', component.required);
      const children: Node[] = [];
      for (const opt of (component.options || [])) {
        const option = document.createElement('option');
        option.append(opt.text);
        if (opt.selected) option.selected = true;
        if (opt.value) option.value = opt.value;
        children.push(option);
      }
      select.replaceChildren(...children);
      updateField(select, 'disabled', component.disabled);
    },
    'BUTTON': ([component, button]) => {
      if (component.text !== undefined) {
        const txt = document.createTextNode(component.text)
        button.replaceChildren(txt);
      }
      updateField(button, 'name', component.name);
      updateField(button, 'value', component.value);
      updateField(button, 'disabled', component.disabled);
    },
    'OUTPUT': ([component, output]) => {
      updateField(output, 'name', component.name);
      updateField(output, 'value', component.value);
    },
    'CANVAS': ([component, output]) => {
      output.classList.add('canvas');
      updateField(output, 'height', component.height);
      updateField(output, 'width', component.width);
    },
  });
  if (ce[0].hidden !== undefined) {
    if (ce[0].hidden) {
      ce[1].classList.add('hidden');
    } else {
      ce[1].classList.remove('hidden');
    }
  }
  updateField(ce[1], 'title', ce[0].title);
  if (id === undefined || state.onEvent === undefined) {
    // Event handlers can't do anything in these cases.
    return;
  } else {
    const handled: string[] = [];
    maybeForward('pointerdown', 'onpointerdown', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('pointerup', 'onpointerup', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('pointermove', 'onpointermove', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('pointerover', 'onpointerover', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('pointerout', 'onpointerout', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('pointerenter', 'onpointerenter', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('pointerleave', 'onpointerleave', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('pointercancel', 'onpointercancel', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('gotpointercapture', 'ongotpointercapture', PointerEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('lostpointercapture', 'onlostpointercapture', PointerEvent, ce[0], ce[1], id, state.onEvent, handled)
    maybeForward('click', 'onclick', MouseEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('dblclick', 'ondblclick', MouseEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('input', 'oninput', InputEvent, ce[0], ce[1], id, state.onEvent, handled);
    maybeForward('change', 'onchange', Event, ce[0], ce[1], id, state.onEvent, handled);
    checkExhaustive(handled);
  }
}

// There's not an easy way to make this a static check, so it's dynamic. I just
// really don't want to forget to make the lists match. This is exercised in a
// test, so failures shouldn't pass pre-commit checks.
function checkExhaustive(handled: string[]) {
  const got = new Set(handled);
  const want = new Set((INPUT_EVENT_TYPES as readonly string[]).concat(POINTER_EVENT_TYPES));
  for (const g of got) {
    if (!want.has(g)) throw new Error(`Missing type def for handled event type: ${g}`)
  }
  for (const w of want) {
    if (!got.has(w)) throw new Error(`Missing handler logic for event type: ${w}`)
  }
}

type EventHandlerHaver<T extends string, E extends Event> = Record<T, ((this: GlobalEventHandlers, ev: E) => any) | null>;
function maybeForward<T extends string, E extends Event>(
  eventSubtype: string, onEventProperty: T, evCls: new (...args: any[]) => E,
  c: FiolinFormPartialComponentElement[0], elem: EventHandlerHaver<T, E>,
  id: FiolinFormComponentId, onEvent: FormEventHandler, handledSubtypes: string[]
): void {
  if ('on' + eventSubtype !== onEventProperty) {
    throw new Error(`Mismatched subtype and property: ${eventSubtype}, ${onEventProperty}`)
  }
  handledSubtypes.push(eventSubtype);
  if (onEventProperty in c) {
    const value = c[onEventProperty as keyof FiolinFormPartialComponentElement[0]];
    if (value === undefined) {
      return;
    } else if (value) {
      elem[onEventProperty] = forwardEvent<E>(id, onEvent);
    } else {
      elem[onEventProperty] = null;
    }
  }
}

function renderComponent(component: FiolinFormComponent, state: RenderState): FiolinFormComponentElement {
  const id = maybeComponentToId(component);
  const ce: FiolinFormComponentElement = createAndPairElement(state.document, component);
  renderInPlace(ce, state, true, maybeComponentToId(ce[0]));
  const mutable = state.uniquelyIdentifiedElems as FiolinFormComponentMapImpl<FiolinFormComponentElement>;
  if (id !== undefined) {
    if (mutable.has(id)) {
      throw new Error(`Two components indistinguishable (${idToRepr(id)})`)
    } else {
      mutable.set(id, ce);
    }
  }
  return ce;
}
