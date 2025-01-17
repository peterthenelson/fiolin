import { FiolinForm, FiolinFormComponent, FiolinFormComponentId, FiolinFormComponentMap } from './types/form';

export function makeId(name: string, value?: string): FiolinFormComponentId {
  if (!name.match(/^[A-za-z][A-Za-z0-9_:\.-]*$/)) {
    throw new Error(`Invalid form input name: ${name}`);
  }
  if (value === undefined) {
    return { name };
  } else {
    return { name, value };
  }
}

export function maybeComponentToId(component: FiolinFormComponent): FiolinFormComponentId | undefined {
  if (component.name === undefined) {
    return undefined;
  }
  if (component.type === 'RADIO' || component.type === 'BUTTON') {
    if (component.value === undefined) {
      throw new Error(`Components with type ${component.type} must specify a value if they specify a name; got ${component}`);
    }
    return makeId(component.name, component.value.toString());
  } else {
    return makeId(component.name);
  }
}

export function idToRepr(id: FiolinFormComponentId): string {
  const maybeVal = id.value !== undefined ? `, value=${id.value}` : '';
  return `name=${id.name}${maybeVal}`;
}

export class FiolinFormComponentMapImpl<T> implements FiolinFormComponentMap<T> {
  private readonly map: Map<string, T>;

  constructor() {
    this.map = new Map();
  }

  has(id: FiolinFormComponentId): boolean {
    return this.map.has(toKey(id));
  }

  delete(id: FiolinFormComponentId): boolean {
    return this.map.delete(toKey(id));
  }

  set(id: FiolinFormComponentId, val: T): this {
    this.map.set(toKey(id), val);
    return this;
  }

  get(id: FiolinFormComponentId): T | undefined {
    return this.map.get(toKey(id));
  }
}

function toKey(id: FiolinFormComponentId): string {
  if (id.value === undefined) {
    return id.name;
  } else {
    return `${id.name}/${id.value}`;
  }
}

export function idToComponentMap(form: FiolinForm): FiolinFormComponentMap<FiolinFormComponent> {
  const map = new FiolinFormComponentMapImpl<FiolinFormComponent>();
  for (const c of form.children) {
    formToIdsHelper(c, map);
  }
  return map;
}

function formToIdsHelper(component: FiolinFormComponent, map: FiolinFormComponentMapImpl<FiolinFormComponent>) {
  const id = maybeComponentToId(component);
  if (id !== undefined) {
    if (map.has(id)) {
      throw new Error(`Two components indistinguishable (${idToRepr(id)})`)
    } else {
      map.set(id, component);
    }
  }
  if (component.type === 'DIV') {
    for (const c of component.children) {
      formToIdsHelper(c, map);
    }
  } else if (component.type === 'LABEL') {
    formToIdsHelper(component.child, map);
  }
}
