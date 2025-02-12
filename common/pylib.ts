import { PyodideInterface } from 'pyodide';

export function getFiolinPy(pyodide: PyodideInterface): string {
  const codePairs = Object.entries(pyodide.ERRNO_CODES);
  return `"""Helpful fiolin-related python utilities."""
import asyncio
import contextlib
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
  global _state
  _state = new_state
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

def _enqueue_helper(form_update):
  _unwrap(js.enqueueFormUpdate(ffi.to_js(form_update, create_pyproxies=False, dict_converter=js.Object.fromEntries)))

def form_set_hidden(name, value=None, hidden=True):
  """Enqueue a form update to hide/show a given form component."""
  _enqueue_helper({
    'type': 'HIDDEN',
    'id': { 'name': name, 'value': value },
    'value': hidden,
  })

def form_set_disabled(name, value=None, disabled=True):
  """Enqueue a form update to disable/enabled a given form component."""
  _enqueue_helper({
    'type': 'DISABLED',
    'id': { 'name': name, 'value': value },
    'value': disabled,
  })

def form_set_focus(name, value=None):
  """Enqueue a form update to focus a given form component."""
  _enqueue_helper({
    'type': 'FOCUS',
    'id': { 'name': name, 'value': value },
  })

def form_set_value(name, value):
  """Enqueue a form update to change value for a given form component."""
  _enqueue_helper({
    'type': 'VALUE',
    'id': { 'name': name },
    'value': value,
  })

def form_update(name, partial, value=None):
  """Enqueue a form update to change arbitrary attributes of a form component.

  Note: The 'type' field is required!
  """
  _enqueue_helper({
    'type': 'PARTIAL',
    'id': { 'name': name, 'value': value },
    'value': partial,
  })

def get_canvas(name):
  """Get the named canvas object, if any.
  
  May be missing even if a corresponding CANVAS exists in the form, e.g., if
  this is running offline.
  """
  if js.canvases:
    return getattr(js.canvases, name, None)
  return None

class _ValuedEvent:
  """Like an asyncio.Event but with a value inside; similar to a golang channel of size 1."""

  def __init__(self):
    """Create a _ValuedEvent."""
    self._value = None
    self._event = asyncio.Event()

  def set(self, value):
    """Set the value (and trigger the event)."""
    self._value = value
    self._event.set()

  def is_set(self):
    """Is the task currently set?"""
    return self._event.is_set()

  async def wait(self):
    """Wait for the event to be set and retrieve the value."""
    await self._event.wait()
    return self._value

  def clear(self):
    """Unset the task and reset the value."""
    self._value = None
    self._event.clear()

async def _to_coro(awaitable):
  """Transform an awaitable maybe-coroutine into a coroutine."""
  await awaitable

def _async_to_js_promise(cb):
  """Wrap a callback as a JS Promise."""
  def _wrapper(*args, **kwargs):
    awaitable = cb(*args, **kwargs)
    async def _wrapper_inner(resolve, reject):
      try:
        res = await awaitable
        resolve(res)
      except Exception as e:
        reject(e)
    return js.Promise.new(_wrapper_inner)
  return _wrapper

@contextlib.asynccontextmanager
async def callback_to_ctx(f, *args, **kwargs):
  """Transform a function that passes a value to a callback into a context manager.

  E.g., if you have function read_and_parse(path, callback_for_parsed_obj),
  you can use it like this:

  > async with callback_to_ctx(read_and_parse, path) as parsed_obj:
  >   # The read_and_parse call will not end until this context manager exits
  >   print(parsed_obj)
  """
  val = _ValuedEvent()
  done = _ValuedEvent()
  async def cb(v):
    val.set(v)
    await done.wait()
  args = list(args)
  if isinstance(f, ffi.JsProxy):
    args.append(_async_to_js_promise(cb))
  else:
    args.append(cb)
  task = asyncio.create_task(_to_coro(f(*args, **kwargs)))
  try:
    yield await val.wait()
  finally:
    done.set(True)
    await task
`;
}

export function getWrapperPy(): string {
  return `
import fiolin
import importlib
import sys

try:
  if 'script' in sys.modules:
    script = importlib.reload(sys.modules['script'])
  else:
    script = importlib.import_module('script')
  main = getattr(script, 'main', None)
  if main:
    await main()
  fiolin.set_output_basenames()
except SyntaxError as e:
  fiolin.js.errorMsg = repr(e)
  fiolin.js.errorLine = e.lineno
except SystemExit as e:
  if e.code:
    fiolin.js.errorMsg = str(e)
except Exception as e:
  fiolin.extract_exc(e)
`;
}
