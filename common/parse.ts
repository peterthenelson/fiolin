// Half-assed validation/parsing library for javascript objects.
export function parseAs<T>(type: Parser<T>, v: unknown): T {
  return type(new ObjPath([]), v);
}

export class ParseError extends Error {
  public readonly objPath: ObjPath;

  constructor(objPath: ObjPath, message: string) {
    super(message);
    this.name = 'ParseError';
    this.objPath = objPath;
  }
}

export class ObjPath {
  public readonly parts: ReadonlyArray<string>;

  constructor(parts: ReadonlyArray<string>) {
    this.parts = parts;
  }

  err(beAMsg: string): Error {
    return new ParseError(this, `Expected ${this.parts.join('.')} to ${beAMsg}`);
  }

  _(part: string): ObjPath {
    return new ObjPath(this.parts.concat(part));
  }
}

export type Parser<V> = (p: ObjPath, v: unknown) => V;

export function pObj(p: ObjPath, v: unknown): object {
  if (v === null) throw p.err(`be an object but it was null`);
  if (typeof v === 'object') return v;
  throw p.err(`be an object; got ${v}`)
}

export function pInst<V>(cls: new (...args: any[])=> V): Parser<V> {
  return (p: ObjPath, v: unknown) => {
    if (typeof v === 'object' && v instanceof cls) return v;
    throw p.err(`be instance of ${cls.name}; got ${v}`);
  };
}

export function pStr(p: ObjPath, v: unknown): string {
  if (typeof v === 'string') return v;
  throw p.err(`be a string; got ${v}`);
}

export function pStrLit<T extends string>(s: T): Parser<T> {
  return (p: ObjPath, v: unknown) => {
    if (typeof v === 'string' && v === s) return s;
    throw p.err(`be literal value "${s}"; got ${v}`);
  }
}

export function pNum(p: ObjPath, v: unknown): number {
  if (typeof v === 'number') return v;
  throw p.err(`be a number; got ${v}`)
}

export function pBool(p: ObjPath, v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  throw p.err(`be a boolean; got ${v}`)
}

export function pArr<V>(elem: Parser<V>): Parser<V[]> {
  return (p: ObjPath, v: unknown) => {
    if (!Array.isArray(v)) {
      throw p.err(`be an array; got ${v}`);
    }
    const vals: V[] = [];
    for (let i = 0; i < v.length; i++) {
      vals.push(elem(p._(`[${i}]`), v[i]));
    }
    return vals;
  };
}

export function pFileEnum(p: ObjPath, v: unknown): 'NONE' | 'SINGLE' | 'MULTI' | 'ANY' {
  if (v === 'NONE' || v === 'SINGLE' || v === 'MULTI' || v === 'ANY') return v;
  throw p.err(`be 'NONE' | 'SINGLE' | 'MULTI' | 'ANY'; got ${v}`);
}

export function pOnlyKeys(p: ObjPath, o: object, keys: string[]) {
  const expected: Set<string> = new Set(keys);
  const actual: Set<string> = new Set(Object.keys(o));
  // Hilariously "Set" has been part of ECMAScript since 2015, but none of the
  // obvious methods like "union" or "difference" were added until 2024, so I
  // guess we'll just do it manually.
  for (const v of actual) {
    if (!expected.has(v)) {
      throw p.err(`have properties ${keys} but found property ${v}`);
    }
  }
}

export function pProp<K extends string, V>(p: ObjPath, o: object, key: K, val: (p: ObjPath, v: unknown) => V): Record<K, V> {
  if (key in o) {
    return { [key]: val(p._(key), o[key as (keyof typeof o)]) } as Record<K, V>;
  }
  throw p.err(`have property ${key}, but no such property exists`);
}

export function pPropU<K extends string, V>(p: ObjPath, o: object, key: K, val: (p: ObjPath, v: unknown) => V): Record<K, V | undefined> {
  if (key in o && typeof o[(key as keyof object)] !== 'undefined') {
    return { [key]: val(p._(key), o[key as (keyof typeof o)]) } as Record<K, V>;
  }
  return { [key]: undefined } as Record<K, undefined>;
}
