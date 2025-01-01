"""
This is just a fake module to make pylance happy. In reality, the fiolin module
is provided by pylib.ts and saved into the emscripten file system. See the
documentation for more information.
"""
def args():
  return {}
def get_input_basename(suffix=''):
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
