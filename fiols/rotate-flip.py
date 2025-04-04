"""Rotate an image."""
import fiolin
import imagemagick as im
import os
import sys

CANVAS_DIM = 400
FMTS = {
  '.bmp': im.MagickFormat.Bmp,
  '.gif': im.MagickFormat.Gif,
  '.jpg': im.MagickFormat.Jpeg,
  '.png': im.MagickFormat.Png,
  '.tiff': im.MagickFormat.Tiff,
  '.webp': im.MagickFormat.WebP,
}

def gen_output_name(state):
  suffix = ''
  if state['degs']:
    suffix += f'-rot{state['degs']}'
  if state['flipped']:
    suffix += '-flipped'
  if state['flopped']:
    suffix += '-flopped'
  return '/output/' + fiolin.get_input_basename(suffix=suffix)

async def blit(ctx, img):
  async with fiolin.callback_to_ctx(img.clone) as copy:
    copy.resize(CANVAS_DIM, CANVAS_DIM)
    w, h = copy.width, copy.height
    x, y = (CANVAS_DIM - w) // 2, (CANVAS_DIM - h) // 2
    fiolin.clear_canvas(ctx)
    await im.draw_to_canvas(ctx, copy, x, y, w, h)

async def main():
  args = fiolin.args()
  state = fiolin.state()
  ctx = fiolin.get_canvas('preview')
  if not state:
    input_path = fiolin.get_input_path()
    _, ext = os.path.splitext(input_path.lower())
    if ext not in FMTS:
      sys.exit(f'Invalid format: {ext}; expected one of {FMTS.keys()}')
    img = im.read_image(input_path)
    fiolin.continue_with({
      'img': img,
      'input_path': input_path,
      'flipped': False,
      'flopped': False,
      'degs': 0,
      'ext': ext,
    })
    state = fiolin.state()
    fiolin.form_set_hidden('page-1', hidden=True)
    fiolin.form_set_hidden('page-2', hidden=False)
  if args.get('reset', False):
    fiolin.continue_with(False)
    fiolin.form_set_hidden('page-1', hidden=False)
    fiolin.form_set_hidden('page-2', hidden=True)
    return
  img = state['img']
  rotate = args.get('rotate', None)
  if rotate is not None:
    degs = int(rotate)
    img.rotate(degs)
    state['degs'] = (state['degs'] + degs) % 360
    fiolin.continue_with(state)
  flip = args.get('flip', None)
  if flip == 'horizontal':
    img.flop()
    state['flopped'] = not state['flopped']
    fiolin.continue_with(state)
  elif flip == 'vertical':
    img.flip()
    state['flipped'] = not state['flipped']
    fiolin.continue_with(state)
  await blit(ctx, img)
  if args.get('download', False):
    ext = state['ext']
    output_path = gen_output_name(state)
    fiolin.form_set_hidden('page-1', hidden=False)
    fiolin.form_set_hidden('page-2', hidden=True)
    fiolin.finish()
    async with fiolin.callback_to_ctx(img.write, FMTS[ext]) as final:
      with open(output_path, 'wb') as f:
        f.write(bytes(final))
