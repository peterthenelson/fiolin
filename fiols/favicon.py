"""Transform a square image into a multi-resolution .ico file."""
import fiolin
import sys
from pyodide import ffi
import imagemagick as im

SIZES = [256, 128, 64, 32, 16]

async def main():
  ctx = fiolin.get_canvas('output')
  if ctx:
    ctx.clearRect(0, 0, 496, 256)
  with open(fiolin.get_input_path(), 'rb') as f:
    orig = f.read()
  collection = im.MagickImageCollection.new()
  for i, n in enumerate(SIZES):
    img = im.MagickImage.create(ffi.to_js(orig))
    if img.baseWidth != img.baseHeight:
      # TODO: Add cropping
      sys.exit(f'Input image not square! ({img.baseWidth}x{img.baseHeight})')
    img.resize(n, n)
    if ctx:
      async with fiolin.callback_to_ctx(img.write, im.MagickFormat.Rgba) as rgba:
        x = sum(SIZES[:i])
        y = 256 - n
        fiolin.put_image(ctx, bytes(rgba), x, y, width=n, height=n)
    collection.push(img)
  async with fiolin.callback_to_ctx(img.write, im.MagickFormat.Ico) as final:
    with open(f'/output/{fiolin.get_input_basename(ext='.ico')}', 'wb') as f:
      f.write(bytes(final))
