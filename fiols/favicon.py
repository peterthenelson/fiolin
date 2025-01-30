"""Transform a square image into a multi-resolution .ico file."""
import fiolin
import sys
from pyodide import ffi
import imagemagick as im

SIZES = [256, 128, 64, 32, 16]

canvas = fiolin.get_canvas('output')
def blitter(n):
  def blit(data):
    if not canvas:
      return
    dx = sum(SIZES[:SIZES.index(n)])
    dy = 256 - n
    imgData = canvas.createImageData(n, n)
    data = bytes(data)
    i = 0
    for _ in range(n):
      for _ in range(n):
        imgData.data[i+0] = data[i+0]
        imgData.data[i+1] = data[i+1]
        imgData.data[i+2] = data[i+2]
        imgData.data[i+3] = data[i+3]
        i += 4
    canvas.putImageData(imgData, dx, dy)
  return blit

def write(data):
  with open(f'/output/{fiolin.get_input_basename(ext='.ico')}', 'wb') as f:
    f.write(bytes(data))

with open(fiolin.get_input_path(), 'rb') as f:
  data = f.read()

collection = im.MagickImageCollection.new()
for n in SIZES:
  img = im.MagickImage.create(ffi.to_js(data))
  if img.baseWidth != img.baseHeight:
    # TODO: Add cropping
    sys.exit(f'Input image not square! ({img.baseWidth}x{img.baseHeight})')
  img.resize(n, n)
  img.write(im.MagickFormat.Rgba, blitter(n))
  collection.push(img)
collection.write(im.MagickFormat.Ico, write)
