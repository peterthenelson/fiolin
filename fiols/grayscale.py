"""Convert a color image to a grayscale one."""
import fiolin
import os
import sys
from pyodide import ffi
import imagemagick as im

def to_format(img, fmt, cb):
  def inner_cb(data):
    cb(bytes(data))
  img.write(fmt, inner_cb)

def save_to_file(path):
  def _save_to_file(data):
    with open(path, 'wb') as f:
      f.write(data)
  return _save_to_file

CANVAS_DIM = 400

class Converter:

  def __init__(self, input_path, output_path, ctx):
    self.input_path = input_path
    self.output_path = output_path
    self.ctx = ctx
    _, ext = os.path.splitext(input_path.lower())
    if ext == '.bmp':
      self.format = im.MagickFormat.Bmp
    elif ext in ('.jpg', '.jpeg'):
      self.format = im.MagickFormat.Jpg
    elif ext == '.png':
      self.format = im.MagickFormat.Png
    elif ext == '.tiff':
      self.format = im.MagickFormat.Tiff
    elif ext == '.webp':
      self.format = im.MagickFormat.WebP
    else:
      sys.exit(f'Unrecognized file type: {ext}')

  def _preview(self, img):
    self.preview_img = img
    if not self.ctx:
      return
    img.resize(CANVAS_DIM, CANVAS_DIM)
    to_format(img, im.MagickFormat.Rgba, self._blit)

  def _blit(self, data):
    w, h = self.preview_img.width, self.preview_img.height
    imgData = self.ctx.createImageData(w, h)
    i = 0
    for _ in range(w*h):
      imgData.data[i+0] = data[i+0]
      imgData.data[i+1] = data[i+1]
      imgData.data[i+2] = data[i+2]
      imgData.data[i+3] = data[i+3]
      i += 4
    self.ctx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM)
    self.ctx.putImageData(imgData, (CANVAS_DIM - w) // 2, (CANVAS_DIM - h) // 2)

  def run(self):
    with open(self.input_path, 'rb') as f:
      data = f.read()
    img = im.MagickImage.create(ffi.to_js(data))
    img.grayscale()
    img.clone(self._preview)
    to_format(img, self.format, save_to_file(self.output_path))

ctx = fiolin.get_canvas('output')
Converter(
  fiolin.get_input_path(),
  f'/output/{fiolin.get_input_basename(suffix='-gray')}',
  ctx
).run()
