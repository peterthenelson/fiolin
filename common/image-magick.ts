import { PyodideInterface } from 'pyodide';
import { FiolinWasmLoader } from './types';
import * as im from '@imagemagick/magick-wasm';
import { isNotFound, mkDir, rmRf, toErrWithErrno } from './emscripten-fs';

export class ImageMagickLoader extends FiolinWasmLoader {
  private src: URL | WebAssembly.Module;

  constructor(imSrc: URL | WebAssembly.Module | Int8Array | Uint8Array | Uint8ClampedArray) {
    super();
    this.src = imSrc;
  }

  async loadModule(pyodide: PyodideInterface): Promise<any> {
    await im.initializeImageMagick(this.src);
    const imfs = (im.ImageMagick as any)._api.FS;
    try {
      const _ = imfs.stat('/py');
      imfs.unmount('/py')
      rmRf(imfs, '/py');
    } catch (e) {
      if (!isNotFound(e)) {
        throw toErrWithErrno(e, `unmount("/py") or rmRf("/py") failed`);
      }
    }
    mkDir(imfs, '/py');
    imfs.mount(pyodide.FS.filesystems.PROXYFS, { root: '/', fs: pyodide.FS }, '/py');
    return im;
  }
}
