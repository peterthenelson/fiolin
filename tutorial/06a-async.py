"""Async functions."""
import asyncio

# Trivial fake async task
async def write_output():
  await asyncio.sleep(3)
  with open('/output/foo.txt', 'w') as f:
    f.write('foo')

# TODO:
# - Right now, the output-extraction code runs before foo.txt is written
# - Wrap this an async main() function to fix this script
write_output()
