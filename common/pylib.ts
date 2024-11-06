import { PyodideInterface } from 'pyodide';

export function getFiolinPy(pyodide: PyodideInterface): string {
  const codePairs = Object.entries(pyodide.ERRNO_CODES);
  return `
# Helpful fiolin-related python utilities; simply import fiolin to use them.
import enum
import js
import os
import sys
import traceback

# TODO: Actual arg parsing
def argv():
  return list(js.argv.split())

def get_input_basename():
  """Gets the (assumed to be single) input file basename."""
  if len(js.inputs):
    return js.inputs[0]
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

def auto_set_outputs():
  """Sets the outputs based on the files in /output."""
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
  tb = e.__traceback__
  while tb:
    if tb.tb_frame.f_code.co_filename == '/home/pyodide/script.py':
      break
    tb = tb.tb_next
  if not tb:
    js.errorMsg = 'extract_exc could not find stack frames for script.py!'
    return (js.errorLine, js.errorMsg)
  js.errorLine = tb.tb_lineno
  js.errorMsg = ''.join(traceback.format_exception(e.with_traceback(tb)))
  return (js.errorLine, js.errorMsg)

class Errno(enum.IntEnum):
${codePairs.map(([s, n]) => `  ${s} = ${n}`).join('\n')}

def errno_to_str(code):
  """Translate an emscripten FS errno code to a symbolic name."""
  return Errno(code).name

def cp(src, dest):
  """Copy a file from src to dest."""
  with open(src, 'rb') as infile:
    with open(dest, 'wb') as outfile:
      outfile.write(infile.read())
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
  fiolin.auto_set_outputs()
except Exception as e:
  fiolin.extract_exc(e)
`;
}
