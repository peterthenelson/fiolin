"""Basic script that copies input to output."""
import fiolin
import os

input = fiolin.get_input_basename()
stem, ext = os.path.splitext(input)

# TODO: Try changing the output filename (foo.txt -> foo-copy.txt or FOO.txt)
# TODO: Also try using fiolin.get_input_basename(suffix='-copy')
# TODO: Also try using fiolin.get_input_basename(ext='.TXT')
output = stem + ext

print(f'Copying /input/{input} to /output/{output}')
fiolin.cp(f'/input/{input}', f'/output/{output}')
