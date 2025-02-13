"""
This is just a fake module to make pylance happy. In reality, the fiolin module
is provided by pylib.ts and saved into the emscripten file system. See the
documentation for more information.
"""
import contextlib
def state():
  return None
def continue_with(new_state):
  pass
def args():
  return {}
def get_input_basename(suffix='', ext=''):
  return ''
def get_input_path():
  return ''
def get_input_basenames():
  return []
def get_input_paths():
  return []
def set_output_basename(output):
  pass
def set_output_basenames(outputs=None):
  pass
def smart_sort(files):
  return []
def tree(path, file=None, prefix=None):
  pass
def extract_exc(e=None):
  return (-1, '')
class Errno:
  E = 1
def errno_to_str(code):
  return ''
def cp(src, dest):
  pass
def form_set_hidden(name, value=None, hidden=True):
  pass
def form_set_disabled(name, value=None, disabled=True):
  pass
def form_set_focus(name, value=None):
  pass
def form_set_value(name, value):
  pass
def form_update(name, partial, value=None):
  pass
def get_canvas(name):
  return None
def put_image(canvas, rgba_data, x, y, width, height):
  return None
@contextlib.asynccontextmanager
async def callback_to_ctx(f, *args, **kwargs):
  yield None