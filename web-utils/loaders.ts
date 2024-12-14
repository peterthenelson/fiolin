import { FiolinWasmLoader } from '../common/types';
import { ImageMagickLoader } from '../common/image-magick';

export function onlineWasmLoaders(): Record<string, FiolinWasmLoader> {
  const im = new URL('/bundle/magick.wasm', self.location.href);
  return { 'imagemagick': new ImageMagickLoader(im) };
}
