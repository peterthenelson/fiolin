import { FiolinJsGlobal, WasmLoader } from './types';
import * as im from '@imagemagick/magick-wasm';

export class ImageMagickLoader extends WasmLoader {
  private src: URL | WebAssembly.Module;

  constructor(imSrc: URL | WebAssembly.Module | Int8Array | Uint8Array | Uint8ClampedArray) {
    super();
    this.src = imSrc;
  }

  async loadModule(): Promise<any> {
    await im.initializeImageMagick(this.src);
    return im;
  }
}
