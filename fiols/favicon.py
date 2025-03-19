"""Transform a square image into a multi-resolution .ico file."""
import fiolin
import sys
from pyodide import ffi
import imagemagick as im

SIZES = [256, 128, 64, 32, 16]

async def main():
  args = fiolin.args()
  state = fiolin.state()
  ctx = fiolin.get_canvas('preview')
  if not state:
    fiolin.clear_canvas(ctx)
    with open(fiolin.get_input_path(), 'rb') as f:
      orig = f.read()
    collection = im.MagickImageCollection.new()
    for i, n in enumerate(SIZES):
      img = im.MagickImage.create(ffi.to_js(orig))
      if img.baseWidth != img.baseHeight:
        # TODO: Add cropping
        sys.exit(f'Input image not square! ({img.baseWidth}x{img.baseHeight})')
      img.resize(n, n)
      if ctx:
        x = sum(SIZES[:i])
        y = 256 - n
        await im.draw_to_canvas(ctx, img, x, y, width=n, height=n)
      collection.push(img)
    state = {
      'collection': collection,
      'output_path': f'/output/{fiolin.get_input_basename(ext='.ico')}',
    }
    fiolin.continue_with(state)
    fiolin.form_set_hidden('start', hidden=True)
    fiolin.form_set_hidden('selected', hidden=False)
  if args.get('reset', False):
    fiolin.continue_with(False)
    fiolin.form_set_hidden('start', hidden=False)
    fiolin.form_set_hidden('selected', hidden=True)
  elif args.get('download', False):
    fiolin.form_set_hidden('start', hidden=False)
    fiolin.form_set_hidden('selected', hidden=True)
    fiolin.finish()
    async with fiolin.callback_to_ctx(state['collection'].write, im.MagickFormat.Ico) as final:
      with open(state['output_path'], 'wb') as f:
        f.write(bytes(final))
