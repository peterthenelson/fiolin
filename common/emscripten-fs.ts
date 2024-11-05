import { PyodideInterface } from 'pyodide/pyodide';
import { toErr } from './errors';

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

export function mkDir(pyodide: PyodideInterface, path: string) {
  try {
    pyodide.FS.mkdir(path);
  } catch (e) {
    throw toErrWithErrno(e, `mkDir("${path}") failed`);
  }
}

export function rmRf(pyodide: PyodideInterface, path: string) {
  try {
    const stats = pyodide.FS.stat(path);
    if (pyodide.FS.isDir(stats.mode)) {
      for (const f of pyodide.FS.readdir(path)) {
        const filePath = path + '/' + f;
        if (filePath !== path + '/.' && filePath !== path + '/..') {
          rmRf(pyodide, filePath);
        }
      }
      pyodide.FS.rmdir(path);
    } else {
      pyodide.FS.unlink(path);
    }
  } catch (e) {
    if (isNotFound(e)) return;
    throw toErrWithErrno(e, `rmRf("${path}") failed`);
  }
}

export function readFile(pyodide: PyodideInterface, path: string): ArrayBuffer {
  try {
    return pyodide.FS.readFile(path);
  } catch (e) {
    throw toErrWithErrno(e, `readFile("${path}") failed`);
  }
}

export function writeFile(pyodide: PyodideInterface, path: string, contents: string | ArrayBuffer) {
  try {
    return pyodide.FS.writeFile(path, contents);
  } catch (e) {
    throw toErrWithErrno(e, `writeFile("${path}") failed`);
  }
}
