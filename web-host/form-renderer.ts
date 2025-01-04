import { FiolinForm, FiolinFormComponent } from '../common/types/form';


export function renderForm(form: FiolinForm): HTMLFormElement {
  const f = document.createElement('form');
  const ctx: RenderContext = {
    autofocusedName: form.autofocusedName,
    autofocusedValue: form.autofocusedValue
  };
  for (const c of form.children) {
    f.append(renderComponent(c, ctx));
  }
  return f;
}

interface RenderContext {
  autofocusedName?: string;
  autofocusedValue?: string;
}

function taggedUnionSwitch<T extends { type: string }, V>(input: T, cases: { [K in T['type']]: (input: Extract<T, { type: K }>) => V }): V {
  for (const [k, val] of Object.entries(cases)) {
    if (k === input.type) {
      return (val as (input: unknown) => V)(input);
    }
  }
  throw new Error(`Expected input.type be one of ${Object.keys(cases).join(' | ')}; got ${input.type}`);
}

function maybeAutofocus(component: FiolinFormComponent, element: HTMLElement, ctx: RenderContext) {
  if ('name' in component && component.name === ctx.autofocusedName) {
    if (!ctx.autofocusedValue) {
      element.autofocus = true;
    } else if ('value' in component && component.value === ctx.autofocusedValue) {
      element.autofocus = true;
    }
  }
}

function renderComponent(component: FiolinFormComponent, ctx: RenderContext): HTMLElement {
  return taggedUnionSwitch(component, {
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
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.checked) input.checked = true;
      return input;
    },
    'COLOR': (component) => {
      const input = document.createElement('input');
      input.type = 'color';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value.toString();
      return input;
    },
    'DATE': (component) => {
      const input = document.createElement('input');
      input.type = 'date';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.required) input.required = true;
      if (component.min) input.min = component.min;
      if (component.max) input.max = component.max;
      if (component.step) input.step = component.step.toString();
      return input;
    },
    'DATETIME_LOCAL': (component) => {
      const input = document.createElement('input');
      input.type = 'date';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.required) input.required = true;
      if (component.min) input.min = component.min;
      if (component.max) input.max = component.max;
      if (component.step) input.step = component.step.toString();
      return input;
    },
    'EMAIL': (component) => {
      const input = document.createElement('input');
      input.type = 'text';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.multiple) input.multiple = component.multiple;
      if (component.pattern) input.pattern = component.pattern;
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.size) input.size = component.size;
      return input;
    },
    'NUMBER': (component) => {
      const input = document.createElement('input');
      input.type = 'number';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value.toString();
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.min) input.min = component.min.toString();
      if (component.max) input.max = component.max.toString();
      if (component.step) input.step = component.step.toString();
      return input;
    },
    'RADIO': (component) => {
      const input = document.createElement('input');
      input.type = 'radio';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      input.value = component.value;
      if (component.checked) input.checked = true;
      if (component.required) input.required = true;
      return input;
    },
    'RANGE': (component) => {
      const input = document.createElement('input');
      input.type = 'range';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value.toString();
      input.min = component.min.toString();
      input.max = component.max.toString();
      if (component.step) input.step = component.step.toString();
      return input;
    },
    'TEL': (component) => {
      const input = document.createElement('input');
      input.type = 'tel';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.pattern) input.pattern = component.pattern;
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.size) input.size = component.size;
      return input;
    },
    'TEXT': (component) => {
      const input = document.createElement('input');
      input.type = 'text';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.pattern) input.pattern = component.pattern;
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.size) input.size = component.size;
      return input;
    },
    'TIME': (component) => {
      const input = document.createElement('input');
      input.type = 'time';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.required) input.required = true;
      if (component.min) input.min = component.min;
      if (component.max) input.max = component.max;
      if (component.step) input.step = component.step.toString();
      return input;
    },
    'URL': (component) => {
      const input = document.createElement('input');
      input.type = 'url';
      maybeAutofocus(component, input, ctx);
      input.name = component.name;
      if (component.value) input.value = component.value;
      if (component.pattern) input.pattern = component.pattern;
      if (component.required) input.required = true;
      if (component.placeholder) input.placeholder = component.placeholder;
      if (component.size) input.size = component.size;
      return input;
    },
    'SELECT': (component) => {
      const select = document.createElement('select');
      maybeAutofocus(component, select, ctx);
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
      return select;
    },
    'BUTTON': (component) => {
      const button = document.createElement('button');
      maybeAutofocus(component, button, ctx);
      button.append(component.text);
      if (component.name) button.name = component.name;
      if (component.value) button.value = component.value;
      return button;
    }
  });
}
