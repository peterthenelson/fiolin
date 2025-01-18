import { typeSwitch } from '../../common/tagged-unions';
import { FiolinScriptInterface } from '../../common/types';
import { FiolinFormComponentMapImpl, idToRepr, makeId, maybeComponentToId } from '../../common/form-utils';
import { FiolinFormComponent, FiolinFormComponentMap } from '../../common/types/form';

export interface RenderedForm {
  form: HTMLFormElement;
  uniquelyIdentifiedElems: FiolinFormComponentMap<HTMLElement>;
}

export function renderForm(ui: FiolinScriptInterface): RenderedForm {
  const rendered: RenderedForm = {
    form: document.createElement('form'),
    uniquelyIdentifiedElems: new FiolinFormComponentMapImpl(),
  }
  if (!ui.form) return rendered;
  const ctx: RenderContext = {
    form: rendered.form,
    ui,
    ids: new FiolinFormComponentMapImpl(),
  };
  for (const c of ui.form.children) {
    rendered.form.append(renderComponent(c, ctx));
  }
  rendered.uniquelyIdentifiedElems = ctx.ids;
  if (ui.form.autofocusedName) {
    const id = makeId(ui.form.autofocusedName, ui.form.autofocusedValue);
    const e = rendered.uniquelyIdentifiedElems.get(id);
    if (e) {
      e.autofocus = true;
    } else {
      throw new Error(`Could not find element to autofocus (${idToRepr(id)})`);
    }
  }
  return rendered;
}

interface RenderContext {
  form: HTMLFormElement;
  ui: FiolinScriptInterface;
  ids: FiolinFormComponentMapImpl<HTMLElement>;
}

function renderComponent(component: FiolinFormComponent, ctx: RenderContext): HTMLElement {
  const id = maybeComponentToId(component);
  const e: HTMLElement = typeSwitch(component, {
    'DIV': (component) => {
      const div = document.createElement('div');
      div.classList.add(`flex-${component.dir.toLowerCase()}-wrap`);
      for (const c of component.children) {
        div.append(renderComponent(c, ctx));
      }
      return div;
    },
    'LABEL': (component) => {
      const label = document.createElement('label');
      label.append(component.text);
      label.append(renderComponent(component.child, ctx));
      return label;
    },
    'CHECKBOX': (component) => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.checked) input.checked = true;
      if (component.disabled) input.disabled = true;
      return input;
    },
    'COLOR': (component) => {
      const input = document.createElement('input');
      input.type = 'color';
      input.name = component.name;
      if (component.value) input.value = component.value.toString();
      if (component.disabled) input.disabled = true;
      return input;
    },
    'DATE': (component) => {
      const input = document.createElement('input');
      input.type = 'date';
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.required) input.required = true;
      if (component.min) input.min = component.min;
      if (component.max) input.max = component.max;
      if (component.step) input.step = component.step.toString();
      if (component.disabled) input.disabled = true;
      return input;
    },
    'DATETIME_LOCAL': (component) => {
      const input = document.createElement('input');
      input.type = 'date';
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.required) input.required = true;
      if (component.min) input.min = component.min;
      if (component.max) input.max = component.max;
      if (component.step) input.step = component.step.toString();
      if (component.disabled) input.disabled = true;
      return input;
    },
    'EMAIL': (component) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.multiple) input.multiple = component.multiple;
      if (component.pattern) input.pattern = component.pattern;
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.size) input.size = component.size;
      if (component.disabled) input.disabled = true;
      return input;
    },
    'FILE': (component) => {
      // TODO: Don't just make an input. Make a little panel.
      const input = document.createElement('input');
      input.type = 'file';
      if (component.name) input.name = component.name;
      if (component.multiple) input.multiple = component.multiple;
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
      if (component.disabled) input.disabled = true;
      return input;
    },
    'NUMBER': (component) => {
      const input = document.createElement('input');
      input.type = 'number';
      input.name = component.name;
      if (component.value) input.value = component.value.toString();
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.min) input.min = component.min.toString();
      if (component.max) input.max = component.max.toString();
      if (component.step) input.step = component.step.toString();
      if (component.disabled) input.disabled = true;
      return input;
    },
    'RADIO': (component) => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = component.name;
      input.value = component.value;
      if (component.checked) input.checked = true;
      if (component.required) input.required = true;
      if (component.disabled) input.disabled = true;
      return input;
    },
    'RANGE': (component) => {
      const input = document.createElement('input');
      input.type = 'range';
      input.name = component.name;
      if (component.value) input.value = component.value.toString();
      input.min = component.min.toString();
      input.max = component.max.toString();
      if (component.step) input.step = component.step.toString();
      if (component.disabled) input.disabled = true;
      return input;
    },
    'TEL': (component) => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.pattern) input.pattern = component.pattern;
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.size) input.size = component.size;
      if (component.disabled) input.disabled = true;
      return input;
    },
    'TEXT': (component) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.pattern) input.pattern = component.pattern;
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.size) input.size = component.size;
      if (component.disabled) input.disabled = true;
      return input;
    },
    'TIME': (component) => {
      const input = document.createElement('input');
      input.type = 'time';
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.required) input.required = true;
      if (component.min) input.min = component.min;
      if (component.max) input.max = component.max;
      if (component.step) input.step = component.step.toString();
      if (component.disabled) input.disabled = true;
      return input;
    },
    'URL': (component) => {
      const input = document.createElement('input');
      input.type = 'url';
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.pattern) input.pattern = component.pattern;
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.size) input.size = component.size;
      if (component.disabled) input.disabled = true;
      return input;
    },
    'SELECT': (component) => {
      const select = document.createElement('select');
      select.name = component.name;
      if (component.multiple) select.multiple = true;
      if (component.required) select.required = true;
      for (const opt of component.options) {
        const option = document.createElement('option');
        option.append(opt.text);
        if (opt.selected) option.selected = true;
        if (opt.value) option.value = opt.value;
        select.append(option);
      }
      if (component.disabled) select.disabled = true;
      return select;
    },
    'BUTTON': (component) => {
      const button = document.createElement('button');
      button.append(component.text);
      if (component.name) button.name = component.name;
      if (component.value) button.value = component.value;
      if (component.disabled) button.disabled = true;
      return button;
    },
    'OUTPUT': (component) => {
      const output = document.createElement('output');
      output.name = component.name;
      if (component.value) output.value = component.value;
      return output;
    },
  });
  if (component.hidden) {
    e.classList.add('hidden');
  }
  if (id !== undefined) {
    if (ctx.ids.has(id)) {
      throw new Error(`Two components indistinguishable (${idToRepr(id)})`)
    } else {
      ctx.ids.set(id, e);
    }
  }
  return e;
}
