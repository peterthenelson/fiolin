"""Flips an image using an async context manager."""
import fiolin
import imagemagick as im

# TODO: Remove this callback function and move its logic into main under an
# async context manager.
def write(data):
  with open(f'/output/{fiolin.get_input_basename(suffix='-flipped')}', 'wb') as f:
    f.write(bytes(data))

async def main():
  input_path = '/py' + fiolin.get_input_path()
  # callback_to_ctx transforms function that take a final callback argument into
  # async context managers where the argument passed to the callback is exposed
  # as a resource within the manager's scope. Note that imagemagick deletes the
  # img once ImageMagick.read terminates, so you really do need some async magic
  # to hoist it out of the callback.
  async with fiolin.callback_to_ctx(im.ImageMagick.read, input_path) as img:
    img.flip()
    # Replace this with another use of callback_to_ctx
    img.write(im.MagickFormat.Jpg, write)
