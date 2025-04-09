"""Autozipping outputs."""
import fiolin
import os

def touch(path, placeholder='foo'):
  os.makedirs(os.path.dirname(path), exist_ok=True)
  with open(path, 'w') as f:
    f.write(placeholder)

# This will fail unless you call fiolin.zip_outputs() before the program ends.
touch('/output/outer/alpha/w.txt')
touch('/output/outer/alpha/x.txt')
touch('/output/outer/beta/y.txt')
touch('/output/outer/gamma/z.txt')
