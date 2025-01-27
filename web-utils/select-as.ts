export function maybeSelectAs<T extends HTMLElement>(root: HTMLElement, sel: string, cls: new (...args: any[])=> T): T | null {
  const elem = root.querySelector(sel);
  if (elem instanceof cls) {
    return (elem as T);
  } else if (elem === null) {
    return null;
  } else {
    throw new Error(`${sel} is not an instance of ${cls}`);
  }
}

export function selectAs<T extends HTMLElement>(root: HTMLElement, sel: string, cls: new (...args: any[])=> T): T {
  const elem = maybeSelectAs(root, sel, cls);
  if (elem === null) {
    throw new Error(`No matches for selector '${sel}'`);
  }
  return elem;
}

export function selectAllAs<T extends HTMLElement>(root: HTMLElement, sel: string, cls: new (...args: any[])=> T): T[] {
  const matches = root.querySelectorAll(sel);
  const elems: T[] = [];
  for (const e of matches) {
    if (e instanceof cls) {
      elems.push(e);
    } else {
      throw new Error(`${sel} matched elements that were not instances of ${cls}`);
    }
  }
  return elems;
}

export function maybeGetByRelIdAs<T extends HTMLElement>(root: HTMLElement, relativeId: string, cls: new (...args: any[])=> T): T | null {
  return maybeSelectAs(root, `[data-rel-id="${relativeId}"]`, cls);
}

export function getByRelIdAs<T extends HTMLElement>(root: HTMLElement, relativeId: string, cls: new (...args: any[])=> T): T {
  return selectAs(root, `[data-rel-id="${relativeId}"]`, cls);
}
