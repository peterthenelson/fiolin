import { FiolinScript, FiolinScriptCode, FiolinScriptMeta, FiolinScriptRuntime, FiolinScriptInterface, FiolinPyPackage } from './types';

// Half-assed validation/parsing library for FiolinScript objects.
export function asFiolinScript(o: object): FiolinScript {
  const p = new ObjPath('');
  pOnlyKeys(p, o, ['meta', 'interface', 'runtime', 'code'])
  return {
    ...pProp(p, o, 'meta', pMeta),
    ...pProp(p, o, 'interface', pInterface),
    ...pProp(p, o, 'runtime', pRuntime),
    ...pProp(p, o, 'code', pCode),
  };
}

class ObjPath {
  public readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  err(beAMsg: string): Error {
    return new Error(`Expected ${this.path} to ${beAMsg}`);
  }

  _(part: string): ObjPath {
    return new ObjPath(`${this.path}.${part}`);
  }
}

type Val<V> = (p: ObjPath, v: unknown) => V;

function pObj(p: ObjPath, v: unknown): object {
  if (v === null) throw p.err(`be an object but it was null`);
  if (typeof v === 'object') return v;
  throw p.err(`be an object; got ${v}`)
}

function pStr(p: ObjPath, v: unknown): string {
  if (typeof v === 'string') return v;
  throw p.err(`be a string; got ${v}`);
}

function pStrA(p: ObjPath, v: unknown): string[] {
  if (Array.isArray(v) && v.every((v) => typeof v === 'string')) return v;
  throw p.err(`be a string[]; got ${v}`);
}

function arr<V>(val: Val<V>): Val<V[]> {
  return (p: ObjPath, v: unknown) => {
    if (!Array.isArray(v)) {
      throw new Error(`be an array; got ${v}`);
    }
    const vals: V[] = [];
    for (const e of v) {
      vals.push(val(p, e));
    }
    return vals;
  }
}

function pFileEnum(p: ObjPath, v: unknown): 'NONE' | 'SINGLE' | 'MULTI' {
  if (v === 'NONE' || v === 'SINGLE' || v === 'MULTI') return v;
  throw p.err(`be 'NONE' | 'SINGLE' | 'MULTI'; got ${v}`);
}

function pOnlyKeys(p: ObjPath, o: object, keys: string[]) {
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

function pProp<K extends string, V>(p: ObjPath, o: object, key: K, val: (p: ObjPath, v: unknown) => V): Record<K, V> {
  if (key in o) {
    return { [key]: val(p._(key), o[key as (keyof typeof o)]) } as Record<K, V>;
  }
  throw p.err(`have property ${key}, but no such property exists`);
}

function pPropU<K extends string, V>(p: ObjPath, o: object, key: K, val: (p: ObjPath, v: unknown) => V): Record<K, V | undefined> {
  if (key in o) {
    return { [key]: val(p._(key), o[key as (keyof typeof o)]) } as Record<K, V>;
  }
  return { [key]: undefined } as Record<K, undefined>;
}

function pMeta(p: ObjPath, v: unknown): FiolinScriptMeta {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['title', 'description', 'author', 'extensions']);
  return {
    ...pProp(p, o, 'title', pStr),
    ...pProp(p, o, 'description', pStr),
    ...pPropU(p, o, 'author', pStr),
    ...pPropU(p, o, 'extensions', pStrA),
  };
}

function pInterface(p: ObjPath, v: unknown): FiolinScriptInterface {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['inputFiles', 'outputFiles']);
  return {
    ...pProp(p, o, 'inputFiles', pFileEnum),
    ...pProp(p, o, 'outputFiles', pFileEnum),
  };
}

function pPyPkg(p: ObjPath, v: unknown): FiolinPyPackage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'name']);
  return {
    ...pProp(p, o, 'type', (p, v): 'PYPI' => {
      if (v === 'PYPI') return v;
      throw p.err(`be PYPI; got ${v}`);
    }),
    ...pProp(p, o, 'name', pStr),
  }
}

function pRuntime(p: ObjPath, v: unknown): FiolinScriptRuntime {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['pythonPkgs']);
  return {
    ...pPropU(p, o, 'pythonPkgs', arr(pPyPkg)),
  };
}

function pCode(p: ObjPath, v: unknown): FiolinScriptCode {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['python']);
  return { ...pProp(p, o, 'python', pStr) };
}
