"""Writing to /output directory.

This (impractical) example script breaks up the text file into 10 chunks.
"""
import fiolin
import math
import os
import sys

infile = fiolin.get_input_basename()
if not infile.endswith('.txt'):
  sys.exit(f'Input file should be a txt file; got {infile}')
with open(f'/input/{infile}') as f:
  contents = f.read()

# Whatever files you write to the /output directory will be downloaded when the
# script finishes. However, this won't work for subdirectories. If you want to
# store a whole hierarchy of files and folders, you should compress them into a
# single output zip file.
# TODO: Try rewriting the script to break up binary files into chunks instead.
print(f'Breaking input file into 10 chunks')
size = len(contents) / 10
stem, _ = os.path.splitext(infile)
for i in range(10):
  with open(f'/output/{stem}-{str(i+1).zfill(2)}.txt', 'w') as f:
    f.write(contents[math.floor(i*size):math.floor((i+1)*size)])

# The fiolin library can be used to explicitly set the output files, but you
# shouldn't need to actually do that. E.g.,
# fiolin.set_output_basename('foo')
