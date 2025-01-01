import { FiolinForm, FiolinFormComponent } from '../common/types/form';


export function renderForm(form: FiolinForm): HTMLFormElement {
  const f = document.createElement('form');
  const ctx: RenderContext = { autofocusedName: form.autofocusedName };
  for (const c of form.children) {
    f.append(renderComponent(c, ctx));
  }
  return f;
}

interface RenderContext {
  autofocusedName?: string;
}

function renderComponent(component: FiolinFormComponent, ctx: RenderContext): HTMLElement {
  if (component.type === 'DIV') {
    const div = document.createElement('div');
    div.classList.add(`flex-${component.dir.toLowerCase()}-wrap`);
    for (const c of component.children) {
      div.append(renderComponent(c, ctx));
    }
    return div;
  } else if (component.type === 'LABEL') {
    const label = document.createElement('label');
    label.append(component.text);
    label.append(renderComponent(component.child, ctx));
    return label;
  } else if (component.type === 'TEXT') {
    const input = document.createElement('input');
    input.name = component.name;
    if (component.name === ctx.autofocusedName) input.autofocus = true;
    if (component.pattern) input.pattern = component.pattern;
    if (component.required) input.required = true;
    if (component.placeholder) input.placeholder = component.placeholder;
    if (component.size) input.size = component.size;
    return input;
  } else if (component.type === 'SELECT') {
    const select = document.createElement('select');
    select.name = component.name;
    if (component.name === ctx.autofocusedName) select.autofocus = true;
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
  } else if (component.type === 'BUTTON') {
    const button = document.createElement('button');
    button.append(component.text);
    if (component.name) button.name = component.name;
    if (component.value) button.value = component.value;
    if (component.name === ctx.autofocusedName) button.autofocus = true;
    return button;
  } else {
    throw new Error(`Expected FiolinFormComponent to have a known type; got "${component}"`);
  }
}
