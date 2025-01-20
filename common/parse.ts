import { TypedPartial } from './tagged-unions';

// Half-assed validation/parsing library for javascript objects.
export type Parser<V> = (p: ObjPath, v: unknown) => V;
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
    return new ParseError(this, `Expected ${this.parts.join('')} to ${beAMsg}`);
  }

  _(part: string): ObjPath {
    return new ObjPath(this.parts.concat(part));
  }

  dot(part: string): ObjPath {
    return new ObjPath(this.parts.concat('.' + part))
  }
}

export function pObj(p: ObjPath, v: unknown): object {
  if (v === null) throw p.err(`be an object but it was null`);
  if (typeof v === 'object') return v;
  throw p.err(`be an object; got ${v}`)
}

// Note: must specify T manually
export function pObjWithProps<T>(props: { [K in keyof Required<T>]: Parser<T[K]> }): Parser<T> {
  return (p: ObjPath, v: unknown) => {
    const o: object = pObj(p, v);
    pOnlyKeys(p, o, Object.keys(props));
    let parsed: Partial<T> = {};
    for (const [k, val] of Object.entries(props)) {
      try {
        parsed[k as keyof T] = (val as Parser<T[keyof T]>)(p.dot(k), o[k as (keyof typeof o)])
      } catch (e) {
        if (k in o) {
          throw e;
        } else {
          throw p.err(`have property ${k}, but no such property exists`);
        }
      }
    }
    return parsed as T;
  }
}

export function pTypedPartialWithProps<T extends string, U extends { type: T }>(props: { [K in keyof Required<U>]: Parser<U[K]> }): Parser<TypedPartial<T, U>> {
  const optionalized = {
    type: props.type,
  } as { [K in keyof Required<U>]: Parser<U[K] | undefined> };
  for (const key of Object.keys(props) as (keyof Required<U>)[]) {
    if (key !== 'type') {
      optionalized[key] = pOpt(props[key]);
    }
  }
  // TODO: should probably use a more specific cast here.
  return pObjWithProps<TypedPartial<T, U>>(optionalized as any);
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

// Note: Confusingly, you will need to manually specify the type as an array
// and also specify all the values. Example:
// type fooOrBar = 'foo' | 'bar'
// pStrUnion<fooOrBar[]>(['foo', 'bar'])
export function pStrUnion<T extends readonly string[]>(values: T): Parser<T[number]> {
  return (p: ObjPath, v: unknown) => {
    if (typeof v === 'string' && values.includes(v)) return v;
    throw p.err(`be one of ${values.join(' | ')}; got ${v}`);
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

export function pOpt<V>(val: Parser<V>): Parser<V | undefined> {
  return (p: ObjPath, v: unknown) => {
    if (typeof v === 'undefined') return v;
    return val(p, v);
  };
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

// Note: must specify T manually
export function pTaggedUnion<T extends { type: string }>(cases: { [K in T['type']]: Parser<Extract<T, { type: K }>> }): Parser<T> {
  return (p: ObjPath, v: unknown) => {
    const o: object = pObj(p, v);
    const tag: string = pStr(p.dot('type'), o['type' as keyof Object]);
    for (const [k, val] of Object.entries(cases)) {
      if (k === tag) {
        return (val as Parser<T>)(p._(`(type=${k})`), o)
      }
    }
    throw p.err(`be one of ${Object.keys(cases).join(' | ')}; got ${tag}`);
  };
}

// Note: drops any non-string keys
export function pRec<V>(val: Parser<V>): Parser<Record<string, V>> {
  return (p: ObjPath, v: unknown) => {
    if (v === null) throw p.err(`be an object but it was null`);
    if (typeof v !== 'object') throw p.err(`be an object; got ${v}`);
    if (Array.isArray(v)) throw p.err(`be an object; got array ${v}`);
    const rec: Record<string, V> = {};
    for (const [k, rawV] of Object.entries(v)) {
      rec[k] = val(p.dot(k), rawV);
    }
    return rec;
  };
}

// Note: must specify T manually
export function pTuple<T extends any[]>(elems: { [K in keyof T]: Parser<T[K]> }): Parser<T> {
  return (p: ObjPath, v: unknown) => {
    if (!Array.isArray(v)) {
      throw p.err(`be an array; got ${v}`);
    } else if (v.length !== elems.length) {
      throw p.err(`be of length ${elems.length}; got ${v.length}`);
    }
    const vals: any[] = [];
    for (let i = 0; i < v.length; i++) {
      vals.push(elems[i](p._(`[${i}]`), v[i]));
    }
    return (vals as T);
  };
}
