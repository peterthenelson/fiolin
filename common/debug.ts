import { PyProxy } from 'pyodide/ffi';

export function dbgType(v: unknown): string {
  if (typeof v === 'object') {
    if (v === null) {
      return 'null';
    } else if (v.constructor.name === 'PyProxy') {
      return `PyProxy<${(v as PyProxy).type}>`;
    } else {
      return v.constructor.name;
    }
  } else {
    return typeof v;
  }
}

export function dbgVal(v: unknown): string {
  let s = `${v}`;
  if (s.length > 30) {
    s = s.slice(0, 30) + '...';
  }
  return s;
}

export function maybeToJs(v: unknown): any {
  if (typeof v === 'object' && v !== null && v.constructor.name === 'PyProxy') {
    return (v as PyProxy).toJs();
  } else {
    return v;
  }
}

export function spyOnMethods(obj: Object, cb: (...args: any[]) => void) {
  return new Proxy(obj, {
    get(target, prop) {
      const value = target[(prop as keyof Object)];
      if (typeof value === 'function') {
        return function (...args: any[]) {
          cb(...args)
          return (value as Function).apply(target, args);
        };
      } else {
        return value;
      }
    }
  });
}
