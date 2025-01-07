"""Transform a square image into a multi-resolution .ico file."""
import fiolin
import sys
from pyodide import ffi
import imagemagick as im

def write(data):
  with open(f'/output/{fiolin.get_input_basename(ext='.ico')}', 'wb') as f:
    f.write(bytes(data))

with open(fiolin.get_input_path(), 'rb') as f:
  data = f.read()

collection = im.MagickImageCollection.new()
for n in [256, 128, 64, 32, 16]:
  img = im.MagickImage.create(ffi.to_js(data))
  if img.baseWidth != img.baseHeight:
    sys.exit(f'Input image not square! ({img.baseWidth}x{img.baseHeight})')
  img.resize(n, n)
  collection.push(img)
collection.write(im.MagickFormat.Ico, write)
