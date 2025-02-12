"""Flip an image."""
import fiolin
# TODO: Edit the yaml file to install the right module
import imagemagick as im

def write(data):
  with open(f'/output/{fiolin.get_input_basename(suffix='-flipped')}', 'wb') as f:
    f.write(bytes(data))

def flip_and_write(img):
  img.flip()
  img.write(im.MagickFormat.Jpg, write)

# NOTE: imagemagick sees the python file system under /py, so the input is like
# /py/input/whatever.jpg instead of /input/whatever.jpg.
# NOTE: imagemagick has a somewhat unwieldy callback-based API. If you'd like to
# write non-trivial imagemagick scripts, check out the async tutorials.
im.ImageMagick.read('/py' + fiolin.get_input_path(), flip_and_write)
