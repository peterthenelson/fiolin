import { toErr } from './errors';

function pathJoin(x: string, y: string): string {
  if (x.charAt(x.length - 1) === '/') {
    return x + y;
  } else {
    return x + '/' + y;
  }
}

export type ErrnoCodes = { [code: string]: number };

function codeToString(errCodes: ErrnoCodes, code: number): string {
  for (const c in errCodes) {
    if (errCodes[c] === code) {
      return c;
    }
  }
  return 'UNKNOWN';
}

export function toErrWithErrno(e: unknown, opts?: { prefix?: string, errCodes?: ErrnoCodes }): Error {
  if (typeof e === 'object' && e !== null && 'errno' in e) {
    const s = opts?.prefix ? opts.prefix + ': ' : '';
    return new Error(`${s}[${codeToString(opts?.errCodes || {}, Number(e.errno))} (errno=${e.errno})]`);
  }
  if (opts?.prefix) {
    return new Error(opts.prefix, { cause: toErr(e) });
  }
  return toErr(e);
}

export function isNotFound(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'errno' in e && e.errno === 44;
}

export function mkDir(fs: any, path: string, errCodes?: ErrnoCodes) {
  try {
    fs.mkdir(path);
  } catch (e) {
    throw toErrWithErrno(e, { prefix: `mkDir("${path}") failed`, errCodes });
  }
}

export function rmRf(fs: any, path: string, errCodes?: ErrnoCodes) {
  try {
    const stats = fs.stat(path);
    if (fs.isDir(stats.mode)) {
      for (const f of fs.readdir(path)) {
        const filePath = path + '/' + f;
        if (filePath !== path + '/.' && filePath !== path + '/..') {
          rmRf(fs, filePath, errCodes);
        }
      }
      fs.rmdir(path);
    } else {
      fs.unlink(path);
    }
  } catch (e) {
    if (isNotFound(e)) return;
    throw toErrWithErrno(e, { prefix: `rmRf("${path}") failed`, errCodes });
  }
}

export function readFile(fs: any, path: string, errCodes?: ErrnoCodes): ArrayBuffer {
  try {
    return fs.readFile(path);
  } catch (e) {
    throw toErrWithErrno(e, { prefix: `readFile("${path}") failed`, errCodes });
  }
}

export function writeFile(fs: any, path: string, contents: string | ArrayBuffer, errCodes?: ErrnoCodes) {
  try {
    return fs.writeFile(path, contents);
  } catch (e) {
    throw toErrWithErrno(e, { prefix: `writeFile("${path}") failed`, errCodes });
  }
}

export function listDir(fs: any, path: string, recursive?: boolean, errCodes?: ErrnoCodes): string[] {
  const files: string[] = [];
  const dirs: string[] = [path];
  while (dirs.length > 0) {
    path = dirs.pop()!;
    let dlist: string[] = [];
    try {
      dlist = fs.readdir(path);
    } catch (e) {
      throw toErrWithErrno(e, { prefix: `readdir("${path}") failed`, errCodes });
    }
    for (let f of dlist) {
      if (f === '.' || f === '..') continue;
      f = pathJoin(path, f);
      console.log(f);
      files.push(f);
      // Note: bug in emscripten file system; /proc/self/fd doesn't (yet)
      // support stat action.
      if (recursive && f !== '/proc/self/fd') {
        let isDir = false;
        try {
          isDir = fs.isDir(fs.stat(f).mode);
        } catch (e) {
          throw toErrWithErrno(e, { prefix: `stat("${f}") failed`, errCodes });
        }
        if (isDir) {
          dirs.push(f);
        }
      }
    }
  }
  return files;
}
