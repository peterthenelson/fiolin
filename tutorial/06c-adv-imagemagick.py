"""Demonstrating more imagemagick features."""
import fiolin
import imagemagick as im

CANVAS_DIM = 400

async def blit(ctx, img):
  w, h = img.width, img.height
  # TODO: Fix the x and y coordinates to center the image on the canvas
  x, y = 0, 0
  await im.draw_to_canvas(ctx, img, x, y, w, h)

async def main():
  args = fiolin.args()
  state = fiolin.state() or { 'input_path': None, 'img': None }
  fiolin.continue_with(state)
  ctx = fiolin.get_canvas('preview')
  if args.get('input-image'):
    state['input_path'] = fiolin.get_input_path()
    # We can't use im.ImageMagick.read, even with callback_to_ctx, because we
    # want to save the result and have it persist across runs. We use this
    # instead:
    state['img'] = im.read_image(state['input_path'])
    state['img'].resize(CANVAS_DIM, CANVAS_DIM)
    await blit(ctx, state['img'])
  if state['img'] is not None and args.get('blur'):
    state['img'].blur(50)
    await blit(ctx, state['img'])
