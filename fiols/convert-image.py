"""Convert an input image to a common image format."""
import fiolin
import sys
import imagemagick as im

FMTS = {
  '.bmp': im.MagickFormat.Bmp,
  '.gif': im.MagickFormat.Gif,
  '.jpg': im.MagickFormat.Jpeg,
  '.png': im.MagickFormat.Png,
  '.tiff': im.MagickFormat.Tiff,
  '.webp': im.MagickFormat.WebP,
}

async def main():
  ext = fiolin.args()['format']
  if ext not in FMTS:
    sys.exit(f'Invalid output format: {ext}; expected one of {FMTS.keys()}')
  input_path = '/py' + fiolin.get_input_path()
  output_path = f'/output/{fiolin.get_input_basename(ext=ext)}'
  async with fiolin.callback_to_ctx(im.ImageMagick.read, input_path) as img:
    async with fiolin.callback_to_ctx(img.write, FMTS[ext]) as data:
      with open(output_path, 'wb') as f:
        f.write(bytes(data))
