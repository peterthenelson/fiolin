"""Reading from /input directory.

This example script calculates the word-count of the input file.
"""
import fiolin
import os
import re
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

# The fiolin library provides some helper functions if you'd like to use them.
# Their names pretty much explain what they do.
assert fiolin.get_input_basename() == inputs[0]
assert fiolin.get_input_path() == f'/input/{inputs[0]}'
assert fiolin.get_input_basenames() == inputs
assert fiolin.get_input_paths() == [f'/input/{i}' for i in inputs]

# Read the file and calculate the word-count
with open(f'/input/{inputs[0]}') as f:
  wc = len(re.split(r'\s+', f.read()))
  print(f'{inputs[0]} contains {wc} total words')
  # TODO: Try calculating and printing the number of bytes and lines too.
