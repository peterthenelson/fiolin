"""Other features of the file system."""
import fiolin
import os

with open(fiolin.get_input_path()) as f:
  contents = f.read()

# Files in /tmp disappear between runs; those in the current dir (== /home) do
# not. It's not necessarily useful to persist anything, since most scripts only
# get run once to completion and then closed, but it's something to know.
for p in ['/tmp/foo', './foo']:
  if os.path.exists(p):
    print(f'The file {p} already exists')
  else:
    print(f'The file {p} does not exist; creating it')
    with open(p, 'w') as f:
      f.write(contents)

# The tree function works like the tree command line utility, printing out the
# structure of a directory. It's useful for debugging.
# TODO: Try out different directories here, to see what the overall file system
# looks like from the perspective of your script.
fiolin.tree('/input')
