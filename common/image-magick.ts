import { PyodideInterface } from 'pyodide';
import { FiolinWasmLoader } from './types';
import * as im from '@imagemagick/magick-wasm';
import { isNotFound, mkDir, rmRf, toErrWithErrno } from './emscripten-fs';
import { dedent } from './indent';

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

  pyWrapper(moduleName: string): string {
    return dedent(`
      import js
      import fiolin

      # Re-export stuff from the wasm module
      for k, v in js.${moduleName}.object_entries():
        globals()[k] = v

      async def draw_to_canvas(ctx, img, x, y, width, height, clear=True):
        """Draw image to canvas 2d context."""
        if not ctx:
          return
        async with fiolin.callback_to_ctx(img.write, MagickFormat.Rgba) as rgba:
          if clear:
            ctx.clearRect(x, y, width, height)
          n = width * height * 4
          if len(rgba) != n:
            raise ValueError(f'Expected image data to have length {width}x{height}x4 = {n}; got {len(rgba)}')
          img_data = ctx.createImageData(width, height)
          for i in range(n):
            img_data.data[i] = rgba[i]
          ctx.putImageData(img_data, x, y)
    `);
  }
}
