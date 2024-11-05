# This is just a fake module to make pylance happy. In reality, the fiolin
# module is provided by pylib.ts and saved into the emscripten file system.
def get_input_basename():
  return ''
def get_input_path():
  return ''
def get_input_basenames():
  return []
def get_input_paths():
  return []
def auto_set_outputs():
  pass
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
