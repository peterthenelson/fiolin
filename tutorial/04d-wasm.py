"""Flip the imagemagick logo."""
# TODO: Edit the yaml file to install the right module
import imagemagick as im

def write(data):
  data = bytes(data)
  with open(f'/output/logo-flipped.jpg', 'wb') as f:
    f.write(data)

def flip_and_write(img):
  img.flip()
  img.write(im.MagickFormat.Jpg, write)

im.ImageMagick.read('logo:', flip_and_write)
