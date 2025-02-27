"""Convert a color image to a grayscale one."""
import fiolin
import os
import sys
import imagemagick as im

CANVAS_DIM = 400
FMTS = {
  '.bmp': im.MagickFormat.Bmp,
  '.gif': im.MagickFormat.Gif,
  '.jpg': im.MagickFormat.Jpeg,
  '.png': im.MagickFormat.Png,
  '.tiff': im.MagickFormat.Tiff,
  '.webp': im.MagickFormat.WebP,
}

async def main():
  input_path = '/py' + fiolin.get_input_path()
  output_path = f'/output/{fiolin.get_input_basename(suffix='-gray')}'
  _, ext = os.path.splitext(input_path.lower())
  if ext not in FMTS:
    sys.exit(f'Invalid format: {ext}; expected one of {FMTS.keys()}')
  ctx = fiolin.get_canvas('output')
  async with fiolin.callback_to_ctx(im.ImageMagick.read, input_path) as img:
    img.grayscale()
    async with fiolin.callback_to_ctx(img.write, FMTS[ext]) as final:
      with open(output_path, 'wb') as f:
        f.write(bytes(final))
    if ctx:
      img.resize(CANVAS_DIM, CANVAS_DIM)
      w, h = img.width, img.height
      x, y = (CANVAS_DIM - w) // 2, (CANVAS_DIM - h) // 2
      fiolin.clear_canvas(ctx)
      await im.draw_to_canvas(ctx, img, x, y, w, h)
