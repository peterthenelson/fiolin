import { PyodideInterface } from 'pyodide';

export function getFiolinPy(pyodide: PyodideInterface): string {
  const codePairs = Object.entries(pyodide.ERRNO_CODES);
  return `"""Helpful fiolin-related python utilities."""
import enum
import functools
import js
import os
from pyodide import ffi
import re
import sys
import traceback

def state():
  """Get saved state from the previous run."""
  return globals().get('_state')

def continue_with(new_state):
  """Set the continue bit and save state for the next run."""
  global state
  state = new_state
  js.partial = True

def args():
  """Get the args dictionary."""
  if not js.args:
    return {}
  return dict(js.args.object_entries())

def get_input_basename(suffix='', ext=None):
  """Gets the (assumed to be single) input file basename.
  
  Optionally adds a suffix or swaps the extension, which is helpful for making
  output file names.
  """
  if len(js.inputs):
    stem, extension = os.path.splitext(js.inputs[0])
    if ext is not None:
      extension = ext
    return stem + suffix + extension
  else:
    raise ValueError(
      f'Expected a single input file but got {js.inputs}; get_input_basename() ' +
      f'should be used in scripts whose interface.inputFiles is "SINGLE"')

def get_input_path():
  """Gets the (assumed to be single) input file path."""
  return f'/input/{get_input_basename()}'

def get_input_basenames():
  """Gets the input file basenames."""
  return list(js.inputs)

def get_input_paths():
  """Gets the input file paths."""
  return [f'/input/{i}' for i in js.inputs]

def set_output_basename(output):
  """Manually sets the output file."""
  set_output_basenames([output])

def set_output_basenames(outputs=None):
  """Sets the outputs; if not specified, adds all matching /output/*."""
  # Respect manual attempts to set outputs
  if outputs is not None:
    js.outputs = outputs
    return
  # If js.outputs has already been set, don't override it.
  if js.outputs:
    return
  js.outputs = []
  for dirpath, _, filenames in os.walk('/output'):
    for f in filenames:
      path = os.path.join(dirpath, f)
      if dirpath != '/output':
        print(f'/output must only have files, not directories; found {path}',
              file=sys.stderr)
      elif f:
        js.outputs.append(f)

def _strip_common_prefix(a, b):
  p_len = len(os.path.commonprefix([a, b]))
  return a[p_len:], b[p_len:]

def _split_num(x):
  m = re.match(r'[-._() ]*(\\d+)[-._() ]*(.*)', x)
  if not m:
    return None, x
  return m.group(1), m.group(2)

def _smart_cmp(a, b):
  if a == b:
    return 0
  orig_a, orig_b = a, b
  while a and b:
    a, b = _strip_common_prefix(a, b)
    a_num, a = _split_num(a)
    b_num, b = _split_num(b)
    if a_num and b_num:
      a_num, b_num = int(a_num), int(b_num)
      if a_num == b_num:
        continue
      else:
        return int(a_num > b_num) - int(a_num < b_num)
    elif a_num and not b_num:
      return 1
    elif not a_num and b_num:
      return -1
    elif a == b:
      return int(orig_a > orig_b) - int(orig_a < orig_b)
    elif not a or not b:
      return int(len(a) > len(b)) - int(len(a) < len(b))
    else:
      return int(a > b) - int(a < b)

def smart_sort(files):
  """Sorts file names in the intuitive order, accounting for sloppy numbering."""
  return sorted(files, key=functools.cmp_to_key(_smart_cmp))

def _gen_prefix(prefix):
  if len(prefix) == 0:
    return ''
  s = ''
  for p in prefix[0:-1]:
    s += '    ' if p else '│   '
  return s + ('└───' if prefix[-1] else '├───')

def tree(path, file=sys.stdout, prefix=None):
  """Like the tree command-line utility; helpful for debugging."""
  prefix = prefix or []
  print(_gen_prefix(prefix) + os.path.basename(path), file=file)
  entries = os.listdir(path)
  entries.sort()
  for i, entry in enumerate(entries):
    full_path = os.path.join(path, entry)
    is_last = i == len(entries) - 1
    if os.path.isdir(full_path):
      tree(full_path, file=file, prefix=prefix + [is_last])
    else:
      print(_gen_prefix(prefix + [is_last]) + entry, file=file)

def extract_exc(e=None):
  """Extract line number from (last) exception and format stack trace."""
  if not e:
    e = sys.last_exc
  if not e:
    js.errorMsg = 'extract_exc called but no Exception occured'
    return (js.errorLine, js.errorMsg)
  # Skip the stackframes from pyodide wrapper code
  # TODO: This doesn't work when the error in script.py is a syntax error
  tb = e.__traceback__
  while tb:
    if tb.tb_frame.f_code.co_filename == '/home/pyodide/script.py':
      break
    tb = tb.tb_next
  if not tb:
    js.errorMsg = 'Warning: extract_exc could not find stack frames for script.py!'
    js.errorMsg += ''.join(traceback.format_exception(e))
    return (js.errorLine, js.errorMsg)
  js.errorLine = tb.tb_lineno
  js.errorMsg = ''.join(traceback.format_exception(e.with_traceback(tb)))
  return (js.errorLine, js.errorMsg)

class Errno(enum.IntEnum):
  """Mapping between symbolic and numeric versions of WASM FS errors."""
${codePairs.map(([s, n]) => `  ${s} = ${n}`).join('\n')}

def errno_to_str(code):
  """Translate an emscripten FS errno code to a symbolic name."""
  return Errno(code).name

def cp(src, dest):
  """Copy a file from src to dest."""
  with open(src, 'rb') as infile:
    with open(dest, 'wb') as outfile:
      outfile.write(infile.read())

def _unwrap(result):
  if result.ok:
    return result.value
  else:
    raise result.error

def form_set_hidden(name, value=None, hidden=True):
  """Enqueue a form update to hide/show a given form component."""
  _unwrap(js.enqueueFormUpdate({
    'type': 'HIDDEN',
    'id': { 'name': name, 'value': value },
    'value': hidden,
  }))

def form_set_disabled(name, value=None, disabled=True):
  """Enqueue a form update to disable/enabled a given form component."""
  _unwrap(js.enqueueFormUpdate({
    'type': 'DISABLED',
    'id': { 'name': name, 'value': value },
    'value': disabled,
  }))

def form_set_focus(name, value=None):
  """Enqueue a form update to focus a given form component."""
  _unwrap(js.enqueueFormUpdate({
    'type': 'FOCUS',
    'id': { 'name': name, 'value': value },
  }))

def form_set_value(name, value):
  """Enqueue a form update to change value for a given form component."""
  _unwrap(js.enqueueFormUpdate({
    'type': 'VALUE',
    'id': { 'name': name },
    'value': value,
  }))
`;
}

export function getWrapperPy(): string {
  return `
import fiolin
import importlib
import sys

try:
  if 'script' in sys.modules:
    importlib.reload(sys.modules['script'])
  else:
    importlib.import_module('script')
  fiolin.set_output_basenames()
except SystemExit as e:
  if e.code:
    fiolin.js.errorMsg = str(e)
except Exception as e:
  fiolin.extract_exc(e)
`;
}
