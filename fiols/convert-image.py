"""Convert an input image to a common image format."""
import fiolin
import sys
from pyodide import ffi
import imagemagick as im

def writer(ext):
  def write(data):
    with open(f'/output/{fiolin.get_input_basename(ext=ext)}', 'wb') as f:
      f.write(bytes(data))
  return write

FMTS = {
  '.bmp': im.MagickFormat.Bmp,
  '.jpg': im.MagickFormat.Jpeg,
  '.png': im.MagickFormat.Png,
  '.tiff': im.MagickFormat.Tiff,
  '.webp': im.MagickFormat.WebP,
}

with open(fiolin.get_input_path(), 'rb') as f:
  data = f.read()
img = im.MagickImage.create(ffi.to_js(data))
ext = fiolin.args()['format']
if ext not in FMTS:
  sys.exit(f'Invalid output format: {ext}; expected one of {FMTS.keys()}')
img.write(FMTS[ext], writer(ext))
