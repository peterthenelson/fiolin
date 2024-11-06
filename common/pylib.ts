import { PyodideInterface } from 'pyodide';

export function getPyLib(pyodide: PyodideInterface): string {
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
  """Sets the outputs based on the files in /output"""
  js.outputs = []
  for dirpath, _, filenames in os.walk('/output'):
    for f in filenames:
      path = os.path.join(dirpath, f)
      if dirpath == '/output':
        js.outputs.append(f)
      else:
        print(f'/output must only have files, not directories; found {path}',
              file=sys.stderr)

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
    return (-1, 'No exception')
  # Skip the stackframes from pyodide wrapper code
  tb = e.__traceback__
  while tb:
    if tb.tb_frame.f_code.co_filename == '<exec>':
      break
    tb = tb.tb_next
  if not tb:
    return (-1, 'No stack frames with <exec>!')
  return (tb.tb_lineno, ''.join(traceback.format_exception(e.with_traceback(tb))))

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
