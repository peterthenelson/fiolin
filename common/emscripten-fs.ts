import { toErr } from './errors';

function pathJoin(x: string, y: string): string {
  if (x.charAt(x.length - 1) === '/') {
    return x + y;
  } else {
    return x + '/' + y;
  }
}

export function toErrWithErrno(e: unknown, prefix?: string): Error {
  if (typeof e === 'object' && e !== null && 'errno' in e) {
    // TODO: Actually translate the errnos to human readable form
    const s = prefix ? prefix + ': ' : '';
    return new Error(`${s}ErrnoError(errno=${e.errno})`);
  }
  if (prefix) {
    return new Error(prefix, { cause: toErr(e) });
  }
  return toErr(e);
}

function isNotFound(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'errno' in e && e.errno === 44;
}

export function mkDir(fs: any, path: string) {
  try {
    fs.mkdir(path);
  } catch (e) {
    throw toErrWithErrno(e, `mkDir("${path}") failed`);
  }
}

export function rmRf(fs: any, path: string) {
  try {
    const stats = fs.stat(path);
    if (fs.isDir(stats.mode)) {
      for (const f of fs.readdir(path)) {
        const filePath = path + '/' + f;
        if (filePath !== path + '/.' && filePath !== path + '/..') {
          rmRf(fs, filePath);
        }
      }
      fs.rmdir(path);
    } else {
      fs.unlink(path);
    }
  } catch (e) {
    if (isNotFound(e)) return;
    throw toErrWithErrno(e, `rmRf("${path}") failed`);
  }
}

export function readFile(fs: any, path: string): ArrayBuffer {
  try {
    return fs.readFile(path);
  } catch (e) {
    throw toErrWithErrno(e, `readFile("${path}") failed`);
  }
}

export function writeFile(fs: any, path: string, contents: string | ArrayBuffer) {
  try {
    return fs.writeFile(path, contents);
  } catch (e) {
    throw toErrWithErrno(e, `writeFile("${path}") failed`);
  }
}

export function listDir(fs: any, path: string, recursive?: boolean): string[] {
  const files: string[] = [];
  const dirs: string[] = [path];
  while (dirs.length > 0) {
    path = dirs.pop()!;
    let dlist: string[] = [];
    try {
      dlist = fs.readdir(path);
    } catch (e) {
      throw toErrWithErrno(e, `readdir("${path}") failed`);
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
          throw toErrWithErrno(e, `stat("${f}") failed`);
        }
        if (isDir) {
          dirs.push(f);
        }
      }
    }
  }
  return files;
}
