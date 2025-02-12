import asyncio
import contextlib

class Destructo:
  """ImageMagick object memory is manually managed and can't be used after disposal."""
  def __init__(self):
    print('Destructo()')
    self.destroyed = False

  def destroy(self):
    print('Destructo().destroy()')
    self.destroyed = True

  def run(self):
    print('Destructo().run()')
    if self.destroyed:
      raise Exception('Already destroyed')

async def destructive_callback_api(cb):
  """ImageMagick has lots of callback-based APIs where objects are immediately destroyed afterwards."""
  d = Destructo()
  await cb(d)
  d.destroy()

class _ValuedEvent:
  """Like an asyncio.Event but with a value inside; similar to a golang channel of size 1."""
  def __init__(self):
    self._value = None
    self._event = asyncio.Event()

  def set(self, value):
    self._value = value
    self._event.set()

  def is_set(self):
    return self._event.is_set()

  async def wait(self):
    await self._event.wait()
    return self._value

  def clear(self):
    self._value = None
    self._event.clear()

@contextlib.asynccontextmanager
async def callback_to_ctx(f, *args, **kwargs):
  val = _ValuedEvent()
  done = _ValuedEvent()
  async def cb(v):
    val.set(v)
    await done.wait()
  args = list(args)
  args.append(cb)
  task = asyncio.create_task(f(*args, **kwargs))
  try:
    yield await val.wait()
  finally:
    done.set(True)
    await task

async def main():
  async with callback_to_ctx(destructive_callback_api) as v:
    v.run()

if __name__ == '__main__':
  asyncio.run(main())