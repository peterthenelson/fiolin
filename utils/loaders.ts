import { FiolinWasmLoader } from '../common/types';
import { ImageMagickLoader } from '../common/image-magick';
import { pkgPath } from './pkg-path';
import { readFileSync } from 'node:fs';

export function offlineWasmLoaders(): Record<string, FiolinWasmLoader> {
  const im = readFileSync(pkgPath('node_modules/@imagemagick/magick-wasm/dist/magick.wasm'));
  return { 'imagemagick': new ImageMagickLoader(im) };
}
