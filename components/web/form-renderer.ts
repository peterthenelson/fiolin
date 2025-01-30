import { typeSwitch } from '../../common/tagged-unions';
import { FiolinScriptInterface } from '../../common/types';
import { FiolinFormComponentMapImpl, idToRepr, makeId, maybeComponentToId } from '../../common/form-utils';
import { FiolinFormComponent, FiolinFormComponentElement, FiolinFormComponentMap, FiolinFormPartialComponentElement } from '../../common/types/form';

export interface RenderedForm {
  form: HTMLFormElement;
  ui: FiolinScriptInterface;
  uniquelyIdentifiedElems: FiolinFormComponentMap<FiolinFormComponentElement>;
}

export function renderForm(ui: FiolinScriptInterface): RenderedForm {
  const rendered: RenderedForm = {
    form: document.createElement('form'),
    ui,
    uniquelyIdentifiedElems: new FiolinFormComponentMapImpl(),
  }
  if (!ui.form) return rendered;
  for (const c of ui.form.children) {
    rendered.form.append(renderComponent(c, rendered)[1]);
  }
  if (ui.form.autofocusedName) {
    const id = makeId(ui.form.autofocusedName, ui.form.autofocusedValue);
    const ce = rendered.uniquelyIdentifiedElems.get(id);
    if (ce) {
      ce[1].autofocus = true;
    } else {
      throw new Error(`Could not find element to autofocus (${idToRepr(id)})`);
    }
  }
  return rendered;
}

function createAndPairElement(component: FiolinFormComponent): FiolinFormComponentElement {
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

export function renderInPlace(ce: FiolinFormPartialComponentElement, ctx: RenderedForm, initial: boolean) {
  ceSwitch(ce, {
    'DIV': ([component, div]) => {
      if (component.dir) div.classList.add(`flex-${component.dir.toLowerCase()}-wrap`);
      if (initial) {
        for (const c of (component.children || [])) {
          div.append(renderComponent(c, ctx)[1]);
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
        label.append(renderComponent(component.child, ctx)[1]);
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
      const accept = component.accept || ctx.ui.inputAccept;
      if (accept) input.accept = accept;
      if (component.submit) {
        input.oncancel = () => {
          input.value = '';
          ctx.form.requestSubmit();
        }
        input.onchange = () => {
          // TODO: Update the text part
          ctx.form.requestSubmit();
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
}

function renderComponent(component: FiolinFormComponent, ctx: RenderedForm): FiolinFormComponentElement {
  const id = maybeComponentToId(component);
  const ce: FiolinFormComponentElement = createAndPairElement(component);
  renderInPlace(ce, ctx, true);
  const mutable = ctx.uniquelyIdentifiedElems as FiolinFormComponentMapImpl<FiolinFormComponentElement>;
  if (id !== undefined) {
    if (mutable.has(id)) {
      throw new Error(`Two components indistinguishable (${idToRepr(id)})`)
    } else {
      mutable.set(id, ce);
    }
  }
  return ce;
}
