"""Flip an image."""
import fiolin
# TODO: Edit the yaml file to install the right module
import imagemagick as im

def write(data):
  data = bytes(data)
  with open(f'/output/{fiolin.get_input_basename(suffix='-flipped')}', 'wb') as f:
    f.write(data)

def flip_and_write(img):
  img.flip()
  img.write(im.MagickFormat.Jpg, write)

# NOTE: imagemagick sees the python file system under /py, so the input is like
# /py/input/whatever.jpg instead of /input/whatever.jpg.
im.ImageMagick.read('/py' + fiolin.get_input_path(), flip_and_write)
