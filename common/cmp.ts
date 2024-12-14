export type KeyF<T> = (v: T) => any[];

export function cmp<T>(a: T, b: T, key?: KeyF<T>): number {
  if (key) {
    return cmpArrayRaw(key(a), key(b));
  } else {
    return cmpRaw(a, b);
  }
}

export function cmpByKey<T>(keyFun: KeyF<T>): (a: T, b: T) => number {
  return (a: T, b: T) => cmpArrayRaw(keyFun(a), keyFun(b));
}

export function cmpSet<T>(a: T[], b: T[], key?: KeyF<T>): number {
  key = key || trivialKey;
  const aKeys: any[][] = a.map(key);
  const bKeys: any[][] = b.map(key);
  aKeys.sort(cmpArrayRaw);
  bKeys.sort(cmpArrayRaw);
  for (let i = 0; i < aKeys.length && i < bKeys.length; i++) {
    const c = cmpArrayRaw(aKeys[i], bKeys[i]);
    if (c !== 0) return c;
  }
  return cmpRaw(aKeys.length, bKeys.length);
}

function trivialKey<T>(a: T): any[] {
  return [a];
}

function cmpRaw<T>(a: T, b: T): number {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

function cmpArrayRaw(a: any[], b: any[]): number {
  for (let i = 0; i < a.length && b.length; i++) {
    const c = cmpRaw(a[i], b[i]);
    if (c !== 0) return c;
  }
  return cmpRaw(a.length, b.length);
}
