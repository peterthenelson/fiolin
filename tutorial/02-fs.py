"""Breaks up long text documents into chunks.

Obviously this script has not practical use. It's just demonstrating how the
file system works.
"""
import math
import os
import sys

# It's not necessary to use the fiolin utility library to get the input files.
# You can just look in /input if you want:
inputs = os.listdir('/input')
assert len(inputs) == 1
if not inputs[0].endswith('.txt'):
  # sys.exit is a clean way to signal errors to the user without a big stack
  # trace. It's totally fine to let exceptions bubble up, but in cases of clear
  # user error, you should prefer sys.exit.
  sys.exit(f'Input file should be a txt file; got {inputs[0]}')

# Files in /tmp disappear between runs; those in the current dir (== /home) do
# not. It's not necessarily useful to persist anything, since most scripts only
# get run once to completion and then closed, but it's something to know.
for p in ['/tmp/foo', './foo']:
  if os.path.exists(p):
    print(f'The file {p} already exists')
  else:
    print(f'The file {p} does not exist; creating it')
    with open(p, 'w') as f:
      f.write('foo')

with open(f'/input/{inputs[0]}') as f:
  contents = f.read()

print(f'Breaking input file into 10 chunks')
size = len(contents) / 10
stem, ext = os.path.splitext(inputs[0])
for i in range(10):
  # Any files written directly into the /output directory will be downloaded
  # when the script finishes. If you want to store a whole hierarchy of files
  # and folders, you should compress them up into a single output zip file.
  with open(f'/output/{stem}-{str(i+1).zfill(2)}.txt', 'w') as f:
    f.write(contents[math.floor(i*size):math.floor((i+1)*size)])
